import {
  type Batch,
  type BatchStep,
  type CreatedBatchesUrls,
  type Certified,
  type BatchesPerMonth,
  type BatchWithDairy,
  type CertificationFail,
  EnumFailTypes,
} from "@types";
import {
  type BatchSensorDataWithCheeseType,
  type IBatchController,
} from "./IBatchController";
import { type IBatchRepository } from "@infrastructure/batches/IBatchRepository";
import { type IDairyRepository } from "@infrastructure/dairies/IDairyRepository";
import { type ISensorRepository } from "@infrastructure/sensors/ISensorRepository";
import { type ICheeseTypeRepository } from "@infrastructure/cheeseTypes/ICheeseTypeRepository";
import { type IBlockchainRepository } from "@infrastructure/blockchain/IBlockchainRepository";

import type IGetTokenByBatchId from "@controllers/tokens/IGetTokenByBatchId";
import type IGetBatchIdByToken from "@controllers/tokens/IGetBatchIdByToken";

import {
  PreconditionError,
  NotFoundError,
  ConsistencyError,
  BlockchainError,
} from "@errors";
import { format } from "date-fns";

type BatchControllerInput = {
  batchRepository: IBatchRepository;
  tokenObtainer?: IGetTokenByBatchId;
  batchIdGetter?: IGetBatchIdByToken;
  dairyRepository?: IDairyRepository;
  sensorRepository?: ISensorRepository;
  cheeseTypeRepository?: ICheeseTypeRepository;
  blockchainRepository?: IBlockchainRepository;
};

class BatchController implements IBatchController {
  private batchRepository;
  private tokenObtainer;
  private batchIdObtainer;
  private dairyRepository;
  private sensorRepository;
  private cheeseTypeRepository;
  private blockchainRepository;
  constructor({
    batchRepository,
    tokenObtainer,
    batchIdGetter,
    dairyRepository,
    sensorRepository,
    cheeseTypeRepository,
    blockchainRepository,
  }: BatchControllerInput) {
    this.batchRepository = batchRepository;
    this.tokenObtainer = tokenObtainer;
    this.batchIdObtainer = batchIdGetter;
    this.dairyRepository = dairyRepository;
    this.sensorRepository = sensorRepository;
    this.cheeseTypeRepository = cheeseTypeRepository;
    this.blockchainRepository = blockchainRepository;
  }

  /**
   * @pre blockchainRepository must be set
   * @throws PreconditionError
   * @throws BlockchainError
   */
  private createCertification = async (
    batch: BatchWithDairy,
    curdInitDateTime: Date,
    curdEndDateTime: Date,
    saltingInitDateTime: Date,
    saltingEndDateTime: Date,
    maturationInitDateTime: Date,
    maturationEndDateTime: Date
  ) => {
    if (!this.blockchainRepository)
      throw new PreconditionError("Blockchain repository expected");

    const { status, certificationMessages } =
      await this.createBatchCertification({
        ...batch,
        curdInitDateTime,
        curdEndDateTime,
        saltingInitDateTime,
        saltingEndDateTime,
        maturationInitDateTime,
        maturationEndDateTime,
      });

    const blockchainData = {
      id: batch.id,
      certificationMessages,
      batchName: batch.batchName ?? undefined,
      cheeseType: batch.cheeseTypeName,
      dairyName: batch.dairy.name,
      dairyRut: batch.dairy.rut,
      status,
      certificationDate: maturationEndDateTime,
    };

    try {
      const blockchainCertificationId =
        this.blockchainRepository.storeCertification(blockchainData);

      return { status, certificationMessages, blockchainCertificationId };
    } catch (error) {
      console.error(
        "There was an error trying to store in the Blockchain",
        error
      );
      throw new BlockchainError(
        "There was an error tying to store in Blockchain"
      );
    }
  };

  /**
   * @pre tokenObtainer must be set
   * @pre dairyRepository must be set
   * @throws NotFoundError
   */
  createBatches: IBatchController["createBatches"] = async (
    batches,
    baseUrl
  ) => {
    if (!this.tokenObtainer)
      throw new PreconditionError("Token obtainer expected");

    if (!this.dairyRepository)
      throw new PreconditionError("Dairy repository expected");
    const batchesUrlByDairy: CreatedBatchesUrls = {};

    for (const { dairyRut, amount } of batches) {
      if (amount <= 0) throw new ConsistencyError("Amount should be positive");

      batchesUrlByDairy[dairyRut] = batchesUrlByDairy[dairyRut] || [];
      const cheeseTypeName = await this.batchRepository.getCheeseTypeByDairyRut(
        dairyRut
      );

      const dairy = await this.dairyRepository.getDairyWithBatchesByRut(
        dairyRut
      );

      const batchesId = await this.batchRepository.createBatches({
        dairyRut,
        cheeseTypeName,
        amount,
      });

      const tokenObtainer = this.tokenObtainer; // We are saving this in this as a constant because if not we would have to do the following check in every for iteration
      batchesId.forEach(({ id }, index) => {
        const token = tokenObtainer.getTokenByBatchId(id);
        const url = `${baseUrl}/producer/batch?token=${token}`;
        batchesUrlByDairy[dairyRut]?.push({
          url: url,
          tagKeys: {
            dairyName: dairy.name,
            batchNumber: dairy.batches.length + index + 1,
          },
        });
      });
    }
    return batchesUrlByDairy;
  };

  /**
   * @pre batchIdObtainer must be set
   * @pre blockchainRepository must be set
   * @throws NotFoundError
   * @throws PreconditionError
   */
  getBatchByToken: IBatchController["getBatchByToken"] = async (
    token: string
  ) => {
    if (!this.batchIdObtainer)
      throw new PreconditionError("No token converter found");
    const batchId = this.batchIdObtainer.getBatchIdByToken(token);
    return this.getBatchById(batchId);
  };

  /**
   * @pre blockchainRepository must be set if batch.blockchainCertificationId is truthy.
   * @throws NotFoundError
   * @throws BlockchainError
   * @throws ConsistencyError
   */
  getBatchById: IBatchController["getBatchById"] = async (id: string) => {
    const batch = await this.batchRepository.getBatchById(id);

    if (batch.blockchainCertificationId) {
      if (!this.blockchainRepository)
        throw new PreconditionError("Blockchain repository expected");

      try {
        const certificationResult =
          await this.blockchainRepository.getCertification(
            batch.blockchainCertificationId
          );

        /**
         * Overriding the batch info with the blockchain info.
         */
        batch.id = certificationResult.id;
        batch.certificationMessages = certificationResult.certificationMessages;
        batch.batchName = certificationResult.batchName ?? null;
        batch.cheeseTypeName = certificationResult.cheeseType;
        batch.dairy.name = certificationResult.dairyName;
        batch.dairyRut = certificationResult.dairyRut;
        batch.certified = certificationResult.status;
        batch.maturationEndDateTime = certificationResult.certificationDate;
      } catch (error) {
        console.error(
          "There was an error trying to get the batch certification from Blockchain",
          error
        );
        throw new BlockchainError(
          "There was an error trying to get the batch certification from Blockchain"
        );
      }
    }

    const { step, currentStepDateTime } = this.getBatchCurrentStep(batch);
    batch.currentStep = step;
    batch.currentStepDateTime = currentStepDateTime;
    return batch;
  };

  startBatch: IBatchController["startBatch"] = async (
    batchId: string,
    cheeseTypeName: string,
    batchName?: string
  ) => {
    const updatedBatch = await this.batchRepository.updateBatch({
      batchId,
      cheeseTypeName,
      batchName,
      started: true,
    });

    const { step, currentStepDateTime } =
      this.getBatchCurrentStep(updatedBatch);
    updatedBatch.currentStep = step;
    updatedBatch.currentStepDateTime = currentStepDateTime;

    return updatedBatch;
  };

  /**
   * @throws NotFoundError
   * @throws ConsistencyError
   * @throws DatabaseError
   */
  startCurd: IBatchController["startCurd"] = async (
    batchId: string,
    initialVolume?: number
  ) => {
    const batch = await this.batchRepository.getBatchById(batchId);

    if (!batch.started || batch.curdInitDateTime)
      throw new ConsistencyError("Batch status was incorrect");

    const updatedBatch = await this.batchRepository.updateBatch({
      batchId,
      initialVolume,
      curdInitDateTime: new Date(),
    });

    const { step, currentStepDateTime } =
      this.getBatchCurrentStep(updatedBatch);
    updatedBatch.currentStep = step;
    updatedBatch.currentStepDateTime = currentStepDateTime;

    return updatedBatch;
  };

  /**
   * @throws NotFoundError
   * @throws ConsistencyError
   * @throws DatabaseError
   */
  finishCurd: IBatchController["finishCurd"] = async (batchId: string) => {
    const batch = await this.batchRepository.getBatchById(batchId);

    if (!batch.started || !batch.curdInitDateTime)
      throw new ConsistencyError("Batch status was incorrect");

    const updatedBatch = await this.batchRepository.updateBatch({
      batchId,
      curdEndDateTime: new Date(),
    });

    const { step, currentStepDateTime } =
      this.getBatchCurrentStep(updatedBatch);
    updatedBatch.currentStep = step;
    updatedBatch.currentStepDateTime = currentStepDateTime;

    return updatedBatch;
  };

  /**
   * @throws NotFoundError
   */
  startSalting: IBatchController["startSalting"] = async (
    batchId: string,
    weightBeforeSalting?: number
  ) => {
    const batch = await this.batchRepository.getBatchById(batchId);

    if (!batch.started || !batch.curdInitDateTime || batch.saltingInitDateTime)
      throw new ConsistencyError("Batch status was incorrect");

    const updatedBatch = await this.batchRepository.updateBatch({
      batchId,
      saltingInitDateTime: new Date(),
      weightBeforeSalting,
    });

    const { step, currentStepDateTime } =
      this.getBatchCurrentStep(updatedBatch);
    updatedBatch.currentStep = step;
    updatedBatch.currentStepDateTime = currentStepDateTime;

    return updatedBatch;
  };

  startMaturation: IBatchController["startMaturation"] = async (
    batchId: string
  ) => {
    const batch = await this.batchRepository.getBatchById(batchId);

    if (
      !batch.started ||
      !batch.curdInitDateTime ||
      !batch.saltingInitDateTime ||
      batch.maturationInitDateTime
    )
      throw new ConsistencyError("Batch status was incorrect");

    const updatedBatch = await this.batchRepository.updateBatch({
      batchId,
      maturationInitDateTime: new Date(),
    });

    const { step, currentStepDateTime } =
      this.getBatchCurrentStep(updatedBatch);
    updatedBatch.currentStep = step;
    updatedBatch.currentStepDateTime = currentStepDateTime;

    return updatedBatch;
  };

  /**
   * @pre sensorRepository must be set
   * @pre cheeseTypeRepository must be set
   * @pre blockchainRepository must be set
   * @throws PreconditionError
   * @throws ConsistencyError
   * @throws NotFoundError
   * @throws BlockchainError
   */
  finishBatch: IBatchController["finishBatch"] = async (
    batchId: string,
    weightAfterMaturation?: number
  ) => {
    if (!this.blockchainRepository)
      throw new PreconditionError("Blockchain repository expected");

    const batch = await this.batchRepository.getBatchById(batchId);

    if (!batch) throw new NotFoundError("batch not found", "BATCH");

    if (
      !batch.started ||
      !batch.curdInitDateTime ||
      !batch.curdEndDateTime ||
      !batch.saltingInitDateTime ||
      !batch.maturationInitDateTime ||
      batch.maturationEndDateTime
    ) {
      console.error("[Batch status was incorrect]:", batch);
      throw new ConsistencyError("Batch status was incorrect");
    }
    batch.maturationEndDateTime = new Date();

    /**
     * Certifying batch.
     */
    const { blockchainCertificationId, certificationMessages, status } =
      await this.createCertification(
        batch,
        batch.curdInitDateTime,
        batch.curdEndDateTime,
        batch.saltingInitDateTime,
        batch.maturationInitDateTime,
        batch.maturationInitDateTime,
        batch.maturationEndDateTime
      );

    const updatedBatch = await this.batchRepository.updateBatch({
      batchId,
      maturationEndDateTime: batch.maturationEndDateTime,
      weightAfterMaturation,
      certified: status,
      certificationMessages,
      blockchainCertificationId,
    });

    const { step, currentStepDateTime } =
      this.getBatchCurrentStep(updatedBatch);
    updatedBatch.currentStep = step;
    updatedBatch.currentStepDateTime = currentStepDateTime;

    return updatedBatch;
  };

  /**
   * @pre sensorRepository must be set
   * @pre cheeseTypeRepository must be set
   * @pre blockchainRepository must be set if input.maturationEndDateTime is truthy.
   * @throws PreconditionError
   * @throws ConsistencyError
   * @throws NotFoundError
   * @throws BlockchainError
   */
  updateSteps: IBatchController["updateSteps"] = async (input) => {
    if (input.maturationEndDateTime && !this.blockchainRepository)
      throw new PreconditionError("Blockchain repository expected");

    if (
      !!input.curdInitDateTime &&
      !!input.curdEndDateTime &&
      input.curdInitDateTime > input.curdEndDateTime
    ) {
      throw new ConsistencyError(
        "Curd init date time should be before curd end date time"
      );
    }

    if (
      !!input.curdEndDateTime &&
      !!input.saltingInitDateTime &&
      input.curdEndDateTime > input.saltingInitDateTime
    ) {
      throw new ConsistencyError(
        "Curd end date time should be before salting init date time"
      );
    }

    if (
      !!input.saltingInitDateTime &&
      !!input.maturationInitDateTime &&
      input.saltingInitDateTime > input.maturationInitDateTime
    ) {
      throw new ConsistencyError(
        "Salting init date time should be before maturation init date time"
      );
    }

    if (
      !!input.maturationInitDateTime &&
      !!input.maturationEndDateTime &&
      input.maturationInitDateTime > input.maturationEndDateTime
    ) {
      throw new ConsistencyError(
        "Maturation init date time should be before maturation end date time"
      );
    }

    const batchInfo: typeof input & {
      certified?: Certified;
      certificationMessages?: CertificationFail[];
      blockchainCertificationId?: string;
    } = input;

    if (
      input.curdInitDateTime &&
      input.curdEndDateTime &&
      input.saltingInitDateTime &&
      input.maturationInitDateTime &&
      input.maturationEndDateTime
    ) {
      const currentBatch = await this.batchRepository.getBatchById(
        input.batchId
      );

      const { status, blockchainCertificationId, certificationMessages } =
        await this.createCertification(
          currentBatch,
          input.curdInitDateTime,
          input.curdEndDateTime,
          input.saltingInitDateTime,
          input.maturationInitDateTime,
          input.maturationInitDateTime,
          input.maturationEndDateTime
        );

      batchInfo.certified = status;
      batchInfo.blockchainCertificationId = blockchainCertificationId;
      batchInfo.certificationMessages = certificationMessages;
    }

    const updatedBatch = await this.batchRepository.updateBatch(batchInfo);

    const { step, currentStepDateTime } =
      this.getBatchCurrentStep(updatedBatch);
    updatedBatch.currentStep = step;
    updatedBatch.currentStepDateTime = currentStepDateTime;

    return updatedBatch;
  };

  /**
   * @pre sensorRepository must be set
   * @pre cheeseTypeRepository must be set
   * @throws NotFoundError
   * @throws PreconditionError
   */
  getBatchSensorDataById: IBatchController["getBatchSensorDataById"] = async (
    batchId: string
  ) => {
    if (!this.sensorRepository)
      throw new PreconditionError("Sensor repository expected");

    if (!this.cheeseTypeRepository)
      throw new PreconditionError("Cheese type repository expected");

    const {
      dairyRut,
      cheeseTypeName,
      curdInitDateTime,
      curdEndDateTime,
      saltingInitDateTime,
      maturationInitDateTime,
      maturationEndDateTime,
    } = await this.batchRepository.getBatchById(batchId);

    const cheeseType = await this.cheeseTypeRepository.getCheeseType(
      cheeseTypeName
    );

    const response: BatchSensorDataWithCheeseType = {
      averageTemperatureInCurd: null,
      averageSalinityInSalting: null,
      averageTemperatureInMaturation: null,
      averageHumidityInMaturation: null,
      cheeseType,
      diffCurdMinutes: null,
      diffSaltingMinutes: null,
      diffMaturationMinutes: null,
      curdInitDateTime,
      saltingInitDateTime,
      maturationInitDateTime,
    };

    if (!curdInitDateTime || !curdEndDateTime) {
      return response;
    }

    const curdSensorReads =
      await this.sensorRepository.getCurdSensorAverageReads({
        dairyRut,
        curdInitDateTime,
        curdEndDateTime,
      });
    response.diffCurdMinutes =
      (curdEndDateTime.getTime() - curdInitDateTime.getTime()) / (1000 * 60);

    response.averageTemperatureInCurd =
      curdSensorReads.averageTemperatureInCurd;

    if (!saltingInitDateTime || !maturationInitDateTime) {
      return response;
    }

    const saltingSensorReads =
      await this.sensorRepository.getSaltingSensorAverageReads({
        dairyRut,
        saltingInitDateTime,
        saltingEndDateTime: maturationInitDateTime,
      });
    response.diffSaltingMinutes =
      (maturationInitDateTime.getTime() - saltingInitDateTime.getTime()) /
      (1000 * 60);

    response.averageSalinityInSalting =
      saltingSensorReads.averageSalinityInSalting;

    if (!maturationEndDateTime) {
      return response;
    }

    const maturationSensorReads =
      await this.sensorRepository.getMaturationSensorAverageReads({
        dairyRut,
        maturationInitDateTime,
        maturationEndDateTime,
      });
    response.diffMaturationMinutes =
      (maturationEndDateTime.getTime() - maturationInitDateTime.getTime()) /
      (1000 * 60);

    response.averageHumidityInMaturation =
      maturationSensorReads.averageHumidityInMaturation;
    response.averageTemperatureInMaturation =
      maturationSensorReads.averageTemperatureInMaturation;

    return response;
  };

  /**
   * @throws ConsistencyError
   * @throws DatabaseError
   */
  getBatchesByDateRange: IBatchController["getBatchesByDateRange"] = async (
    input
  ) => {
    if (input.minDate > input.maxDate)
      throw new ConsistencyError("Min date has to be previous to max date");

    const result = await this.batchRepository.getBatchesByDateRange(input);

    return result;
  };

  /**
   * @throws DatabaseError
   */
  getBatchesStats: IBatchController["getBatchesStats"] = async () =>
    await this.batchRepository.getBatchesStats();

  private getBatchCurrentStep: (batch: Batch) => {
    step: BatchStep;
    currentStepDateTime?: Date;
  } = (batch) => {
    if (!batch.started) return { step: "NotStarted" };

    if (!batch.curdInitDateTime) return { step: "Started" };

    if (!batch.curdEndDateTime)
      return { step: "Curd", currentStepDateTime: batch.curdInitDateTime };

    if (!batch.saltingInitDateTime)
      return {
        step: "CurdFinished",
        currentStepDateTime: batch.curdEndDateTime,
      };

    if (!batch.maturationInitDateTime)
      return {
        step: "Salting",
        currentStepDateTime: batch.saltingInitDateTime,
      };

    if (!batch.maturationEndDateTime)
      return {
        step: "Maturation",
        currentStepDateTime: batch.maturationInitDateTime,
      };
    return {
      step: "Finished",
      currentStepDateTime: batch.maturationEndDateTime,
    };
  };

  /**
   * @pre sensorRepository must be set
   * @pre cheeseTypeRepository must be set
   * @throws PreconditionError
   * @throws ConsistencyError
   */
  private createBatchCertification: (batch: {
    id: string;
    dairyRut: number;
    cheeseTypeName: string;
    curdInitDateTime: Date;
    curdEndDateTime: Date;
    saltingInitDateTime: Date;
    saltingEndDateTime: Date;
    maturationInitDateTime: Date;
    maturationEndDateTime: Date;
  }) => Promise<{
    status: Certified;
    certificationMessages?: CertificationFail[];
  }> = async ({
    id,
    dairyRut,
    cheeseTypeName,
    curdInitDateTime,
    curdEndDateTime,
    saltingInitDateTime,
    saltingEndDateTime,
    maturationInitDateTime,
    maturationEndDateTime,
  }) => {
    if (!this.sensorRepository)
      throw new PreconditionError("Sensor repository expected");
    if (!this.cheeseTypeRepository)
      throw new PreconditionError("Cheese type repository expected");

    if (
      !curdInitDateTime ||
      !curdEndDateTime ||
      !saltingInitDateTime ||
      !maturationInitDateTime ||
      !maturationEndDateTime
    )
      throw new ConsistencyError(
        "The batch must have every date defined to be certified"
      );

    const cheeseType = await this.cheeseTypeRepository.getCheeseType(
      cheeseTypeName
    );
    const curdTimeTolerancePercentage = 10;
    const saltingTimeTolerancePercentage = 10;
    const maturationTimeTolerancePercentage = 15;
    const curdTemperatureTolerancePercentage = 5;
    const saltingSalinityTolerancePercentage = 10;
    const maturationTemperatureTolerancePercentage = 20;
    const maturationHumidityTolerancePercentage = 2;

    const maxAdmissibleErrors = 5;
    const admissibleErrors: CertificationFail[] = [];

    /**
     * Checking times for each step.
     */
    const diffCurdMinutes =
      (curdEndDateTime.getTime() - curdInitDateTime.getTime()) / (1000 * 60);

    const timeFailureMessage = (
      measurementTimeInMinutes: number,
      targetTimeInMinutes: number,
      step: string,
      comparisonType: string
    ) =>
      `El tiempo de ${step} fue de ${parseFloat(
        measurementTimeInMinutes.toFixed(1)
      )} minutos y debe ser ${comparisonType} o igual que ${targetTimeInMinutes} minutos`;

    // Inadmissible
    if (
      diffCurdMinutes <
      cheeseType.minCurdMinutes -
        (curdTimeTolerancePercentage / 100) * cheeseType.minCurdMinutes
    ) {
      console.log(
        `[[Batch ${id} certification failed]]: Curd time was incorrect
          --> Time was ${diffCurdMinutes} minutes and should be greater than or equal to
          ${cheeseType.minCurdMinutes} minutes`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: timeFailureMessage(
              diffCurdMinutes,
              cheeseType.minCurdMinutes,
              "coagulación y cocción",
              "mayor"
            ),
            failType: EnumFailTypes.curdMinTimeInadmissible,
          },
        ],
      };
    }

    // Admissible
    if (diffCurdMinutes < cheeseType.minCurdMinutes) {
      console.log(
        `[[Batch ${id} certification failed]]: Curd time was incorrect
          --> Time was ${diffCurdMinutes} minutes and should be greater than or equal to
          ${cheeseType.minCurdMinutes} minutes`
      );
      admissibleErrors.push({
        message: timeFailureMessage(
          diffCurdMinutes,
          cheeseType.minCurdMinutes,
          "coagulación y cocción",
          "mayor"
        ),
        failType: EnumFailTypes.curdMinTimeAdmissible,
      });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    // Inadmissible
    if (
      diffCurdMinutes >
      cheeseType.maxCurdMinutes +
        (curdTimeTolerancePercentage / 100) * cheeseType.maxCurdMinutes
    ) {
      console.log(
        `[[Batch ${id} certification failed]]: Curd time was incorrect
          --> Time was ${diffCurdMinutes} minutes and should be less than or equal to
          ${cheeseType.maxCurdMinutes} minutes`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: timeFailureMessage(
              diffCurdMinutes,
              cheeseType.maxCurdMinutes,
              "coagulación y cocción",
              "menor"
            ),
            failType: EnumFailTypes.curdMaxTimeInadmissible,
          },
        ],
      };
    }

    // Admissible
    if (diffCurdMinutes > cheeseType.maxCurdMinutes) {
      console.log(
        `[[Batch ${id} certification failed]]: Curd time was incorrect
          --> Time was ${diffCurdMinutes} minutes and should be less than or equal to
          ${cheeseType.maxCurdMinutes} minutes`
      );
      admissibleErrors.push({
        message: timeFailureMessage(
          diffCurdMinutes,
          cheeseType.maxCurdMinutes,
          "coagulación y cocción",
          "menor"
        ),

        failType: EnumFailTypes.curdMaxTimeAdmissible,
      });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    const diffSaltingMinutes =
      (maturationInitDateTime.getTime() - saltingInitDateTime.getTime()) /
      (1000 * 60);

    // Inadmissible
    if (
      diffSaltingMinutes <
      cheeseType.minSaltingMinutes -
        (saltingTimeTolerancePercentage / 100) * cheeseType.minSaltingMinutes
    ) {
      console.log(
        `[[Batch ${id} certification failed]]: Salting time was incorrect
          --> Time was ${diffSaltingMinutes} minutes and should be greater than or equal to
          ${cheeseType.minSaltingMinutes} minutes`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: timeFailureMessage(
              diffSaltingMinutes,
              cheeseType.minSaltingMinutes,
              "salmuera",
              "mayor"
            ),

            failType: EnumFailTypes.saltingMinTimeInadmissible,
          },
        ],
      };
    }

    // Admissible
    if (diffSaltingMinutes < cheeseType.minSaltingMinutes) {
      console.log(
        `[[Batch ${id} certification failed]]: Salting time was incorrect
          --> Time was ${diffSaltingMinutes} minutes and should be greater than or equal to
          ${cheeseType.minSaltingMinutes} minutes`
      );
      admissibleErrors.push({
        message: timeFailureMessage(
          diffSaltingMinutes,
          cheeseType.minSaltingMinutes,
          "salmuera",
          "mayor"
        ),

        failType: EnumFailTypes.saltingMinTimeAdmissible,
      });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    // Inadmissible
    if (
      diffSaltingMinutes >
      cheeseType.maxSaltingMinutes +
        (saltingTimeTolerancePercentage / 100) * cheeseType.maxSaltingMinutes
    ) {
      console.log(
        `[[Batch ${id} certification failed]]: Salting time was incorrect
        --> Time was ${diffSaltingMinutes} minutes and should be less than or equal to
        ${cheeseType.maxSaltingMinutes} minutes`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: timeFailureMessage(
              diffSaltingMinutes,
              cheeseType.maxSaltingMinutes,
              "salmuera",
              "menor"
            ),

            failType: EnumFailTypes.saltingMaxTimeInadmissible,
          },
        ],
      };
    }

    // Admissible
    if (
      diffSaltingMinutes >
      cheeseType.maxSaltingMinutes +
        (saltingTimeTolerancePercentage / 100) * cheeseType.maxSaltingMinutes
    ) {
      console.log(
        `[[Batch ${id} certification failed]]: Salting time was incorrect
        --> Time was ${diffSaltingMinutes} minutes and should be less than or equal to
        ${cheeseType.maxSaltingMinutes} minutes`
      );
      admissibleErrors.push({
        message: timeFailureMessage(
          diffSaltingMinutes,
          cheeseType.maxSaltingMinutes,
          "salmuera",
          "menor"
        ),

        failType: EnumFailTypes.saltingMaxTimeAdmissible,
      });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    const diffMaturationMinutes =
      (maturationEndDateTime.getTime() - maturationInitDateTime.getTime()) /
      (1000 * 60);

    // Inadmissible
    if (
      diffMaturationMinutes <
      cheeseType.minMaturationMinutes -
        (maturationTimeTolerancePercentage / 100) *
          cheeseType.minMaturationMinutes
    ) {
      console.log(
        `[[Batch ${id} certification failed]]: Maturation time was incorrect
      --> Time was ${diffMaturationMinutes} minutes and should be greater than or equal to
      ${cheeseType.minMaturationMinutes} minutes`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: timeFailureMessage(
              diffMaturationMinutes,
              cheeseType.minMaturationMinutes,
              "maduración",
              "mayor"
            ),
            failType: EnumFailTypes.maturationMinTimeInadmissible,
          },
        ],
      };
    }

    // Admissible
    if (diffMaturationMinutes < cheeseType.minMaturationMinutes) {
      console.log(
        `[[Batch ${id} certification failed]]: Maturation time was incorrect
      --> Time was ${diffMaturationMinutes} minutes and should be greater than or equal to
      ${cheeseType.minMaturationMinutes} minutes`
      );
      admissibleErrors.push({
        message: timeFailureMessage(
          diffMaturationMinutes,
          cheeseType.minMaturationMinutes,
          "maduración",
          "mayor"
        ),
        failType: EnumFailTypes.maturationMinTimeAdmissible,
      });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    // Inadmissible
    if (
      diffMaturationMinutes >
      cheeseType.maxMaturationMinutes +
        (maturationTimeTolerancePercentage / 100) *
          cheeseType.maxMaturationMinutes
    ) {
      console.log(
        `[[Batch ${id} certification failed]]: Maturation time was incorrect
        --> Time was ${diffMaturationMinutes} minutes and should be less than or equal to
        ${cheeseType.maxMaturationMinutes} minutes`
      );

      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: timeFailureMessage(
              diffMaturationMinutes,
              cheeseType.maxMaturationMinutes,
              "maduración",
              "menor"
            ),

            failType: EnumFailTypes.maturationMaxTimeInadmissible,
          },
        ],
      };
    }

    // Admissible
    if (diffMaturationMinutes > cheeseType.maxMaturationMinutes) {
      console.log(
        `[[Batch ${id} certification failed]]: Maturation time was incorrect
        --> Time was ${diffMaturationMinutes} minutes and should be less than or equal to
        ${cheeseType.maxMaturationMinutes} minutes`
      );
      admissibleErrors.push({
        message: timeFailureMessage(
          diffMaturationMinutes,
          cheeseType.maxMaturationMinutes,
          "maduración",
          "menor"
        ),

        failType: EnumFailTypes.maturationMaxTimeAdmissible,
      });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    /**
     * Checking parameters for each step.
     */
    const sensorReads = await this.sensorRepository.getSensorReads({
      dairyRut,
      curdInitDateTime,
      curdEndDateTime,
      saltingInitDateTime,
      saltingEndDateTime,
      maturationInitDateTime,
      maturationEndDateTime,
    });

    const notFoundReadsFailureMessage = (step: string) =>
      `No se encontraron lecturas en ${step}`;

    // Inadmissible
    if (sensorReads.curd.length === 0) {
      console.log(
        `[[Batch ${id} certification failed]]: No reads found for the curd step`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: notFoundReadsFailureMessage("la coagulación y cocción"),
            failType: EnumFailTypes.curdNoReadsInadmissible,
          },
        ],
      };
    }

    // Inadmissible
    if (sensorReads.salting.length === 0) {
      console.log(
        `[[Batch ${id} certification failed]]: No reads found for the salting step`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: notFoundReadsFailureMessage("la salmuera"),
            failType: EnumFailTypes.saltingNoReadsInadmissible,
          },
        ],
      };
    }

    // Inadmissible
    if (sensorReads.maturation.length === 0) {
      console.log(
        `[[Batch ${id} certification failed]]: No reads found for the maturation step`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: notFoundReadsFailureMessage("la maduración"),
            failType: EnumFailTypes.maturationNoReadsInadmissible,
          },
        ],
      };
    }

    /**
     * Checking reads.
     */

    /**
     * The intention of this function is to accept only a type Date, so the output is always a string
     * @params Date
     * @returns string
     */
    const formatDateAndTime = (date: Date) => {
      try {
        return format(date, "dd/MM/yyyy HH:mm");
      } catch (error) {
        throw new Error("Invalid date and time format");
      }
    };
    const readsFailureMessage = (
      measurementRead: number,
      targetMeasure: number,
      measure: string,
      step: string,
      comparisonType: string,
      readDateTime: Date
    ) =>
      `La ${measure} en ${step} fue de ${parseFloat(
        measurementRead.toFixed(1)
      )} y el ${comparisonType} permitido es ${targetMeasure}, en la lectura del ${formatDateAndTime(
        readDateTime
      )}`;

    /**
     * Checking curd reads.
     */

    // Inadmissible
    const inadmissibleFailingMinCurdRead = sensorReads.curd.find(
      (read) =>
        read.temperature <
        cheeseType.minCurdTemperature -
          (curdTemperatureTolerancePercentage / 100) *
            cheeseType.minCurdTemperature
    );

    if (inadmissibleFailingMinCurdRead) {
      console.log(
        `[[Batch ${id} certification failed]]: Minimum curd temperature failed: ${formatDateAndTime(
          inadmissibleFailingMinCurdRead.datetime
        )} --> Temperature: ${inadmissibleFailingMinCurdRead.temperature}
        --> Minimum allowed: ${cheeseType.minCurdTemperature}`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: readsFailureMessage(
              inadmissibleFailingMinCurdRead.temperature,
              cheeseType.minCurdTemperature,
              "temperatura",
              "la coagulación y cocción",
              "mínimo",
              inadmissibleFailingMinCurdRead.datetime
            ),
            failType: EnumFailTypes.curdMinTemperatureInadmissible,
          },
        ],
      };
    }

    // Admissible
    const admissibleFailingMinCurdReads = sensorReads.curd.filter(
      (read) => read.temperature < cheeseType.minCurdTemperature
    );

    if (admissibleFailingMinCurdReads.length > 0) {
      admissibleFailingMinCurdReads
        .slice(0, maxAdmissibleErrors - admissibleErrors.length + 1)
        .forEach((read) => {
          console.log(
            `[[Batch ${id} certification failed]]: Minimum curd temperature failed: ${formatDateAndTime(
              read.datetime
            )}
            --> Temperature: ${read.temperature}
            --> Minimum allowed: ${cheeseType.minCurdTemperature}`
          );
          admissibleErrors.push({
            message: readsFailureMessage(
              read.temperature,
              cheeseType.minCurdTemperature,
              "temperatura",
              "la coagulación y cocción",
              "mínimo",
              read.datetime
            ),

            failType: EnumFailTypes.curdMinTemperatureAdmissible,
          });
        });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    // Inadmissible
    const inadmissibleFailingMaxCurdRead = sensorReads.curd.find(
      (read) =>
        read.temperature >
        cheeseType.maxCurdTemperature +
          (curdTemperatureTolerancePercentage / 100) *
            cheeseType.maxCurdTemperature
    );

    if (inadmissibleFailingMaxCurdRead) {
      console.log(
        `[[Batch ${id} certification failed]]: Maximum curd temperature failed: ${formatDateAndTime(
          inadmissibleFailingMaxCurdRead.datetime
        )} --> Temperature: ${inadmissibleFailingMaxCurdRead.temperature}
        --> Maximum allowed: ${cheeseType.maxCurdTemperature}`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: readsFailureMessage(
              inadmissibleFailingMaxCurdRead.temperature,
              cheeseType.maxCurdTemperature,
              "temperatura",
              "la coagulación y cocción",
              "máximo",
              inadmissibleFailingMaxCurdRead.datetime
            ),

            failType: EnumFailTypes.curdMaxTemperatureInadmissible,
          },
        ],
      };
    }

    // Admissible
    const admissibleFailingMaxCurdReads = sensorReads.curd.filter(
      (read) => read.temperature > cheeseType.maxCurdTemperature
    );

    if (admissibleFailingMaxCurdReads.length > 0) {
      admissibleFailingMaxCurdReads
        .slice(0, maxAdmissibleErrors - admissibleErrors.length + 1)
        .forEach((read) => {
          console.log(
            `[[Batch ${id} certification failed]]: Maximum curd temperature failed: ${formatDateAndTime(
              read.datetime
            )}
            --> Temperature: ${read.temperature}
            --> Maximum allowed: ${cheeseType.maxCurdTemperature}`
          );
          admissibleErrors.push({
            message: readsFailureMessage(
              read.temperature,
              cheeseType.maxCurdTemperature,
              "temperatura",
              "la coagulación y cocción",
              "máximo",
              read.datetime
            ),

            failType: EnumFailTypes.curdMaxTemperatureAdmissible,
          });
        });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    /**
     * Checking salting reads.
     */

    // Inadmissible
    const inadmissiblefailingMinSaltingRead = sensorReads.salting.find(
      (read) =>
        read.salinity <
        cheeseType.minSaltingSalinity -
          (saltingSalinityTolerancePercentage / 100) *
            cheeseType.minSaltingSalinity
    );

    if (inadmissiblefailingMinSaltingRead) {
      console.log(
        `[[Batch ${id} certification failed]]: Minimum salting salinity failed: ${formatDateAndTime(
          inadmissiblefailingMinSaltingRead.datetime
        )} --> Salinity: ${inadmissiblefailingMinSaltingRead.salinity}
        --> Minimum allowed: ${cheeseType.minSaltingSalinity}`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: readsFailureMessage(
              inadmissiblefailingMinSaltingRead.salinity,
              cheeseType.minSaltingSalinity,
              "salinidad",
              "la salmuera",
              "mínimo",
              inadmissiblefailingMinSaltingRead.datetime
            ),

            failType: EnumFailTypes.saltingMinSalinityInadmissible,
          },
        ],
      };
    }

    // Admissible
    const admissiblefailingMinSaltingReads = sensorReads.salting.filter(
      (read) => read.salinity < cheeseType.minSaltingSalinity
    );

    if (admissiblefailingMinSaltingReads.length > 0) {
      admissiblefailingMinSaltingReads
        .slice(0, maxAdmissibleErrors - admissibleErrors.length + 1)
        .forEach((read) => {
          console.log(
            `[[Batch ${id} certification failed]]: Minimum salting salinity failed: ${formatDateAndTime(
              read.datetime
            )} --> Salinity: ${read.salinity}
        --> Minimum allowed: ${cheeseType.minSaltingSalinity}`
          );
          admissibleErrors.push({
            message: readsFailureMessage(
              read.salinity,
              cheeseType.minSaltingSalinity,
              "salinidad",
              "la salmuera",
              "mínimo",
              read.datetime
            ),

            failType: EnumFailTypes.saltingMinSalinityAdmissible,
          });
        });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    // Inadmissible
    const inadmissibleFailingMaxSaltingRead = sensorReads.salting.find(
      (read) =>
        read.salinity >
        cheeseType.maxSaltingSalinity +
          (saltingSalinityTolerancePercentage / 100) *
            cheeseType.maxSaltingSalinity
    );

    if (inadmissibleFailingMaxSaltingRead) {
      console.log(
        `[[Batch ${id} certification failed]]: Maximum salting salinity failed: ${formatDateAndTime(
          inadmissibleFailingMaxSaltingRead.datetime
        )} --> Salinity: ${inadmissibleFailingMaxSaltingRead.salinity}
        --> Maximum allowed: ${cheeseType.maxSaltingSalinity}`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: readsFailureMessage(
              inadmissibleFailingMaxSaltingRead.salinity,
              cheeseType.maxSaltingSalinity,
              "salinidad",
              "la salmuera",
              "máximo",
              inadmissibleFailingMaxSaltingRead.datetime
            ),

            failType: EnumFailTypes.saltingMaxSalinityInadmissible,
          },
        ],
      };
    }

    // Admissible
    const admissibleFailingMaxSaltingReads = sensorReads.salting.filter(
      (read) => read.salinity > cheeseType.maxSaltingSalinity
    );

    if (admissibleFailingMaxSaltingReads.length > 0) {
      admissibleFailingMaxSaltingReads
        .slice(0, maxAdmissibleErrors - admissibleErrors.length + 1)
        .forEach((read) => {
          console.log(
            `[[Batch ${id} certification failed]]: Maximum salting salinity failed: ${formatDateAndTime(
              read.datetime
            )} --> Salinity: ${read.salinity}
        --> Maximum allowed: ${cheeseType.maxSaltingSalinity}`
          );
          admissibleErrors.push({
            message: readsFailureMessage(
              read.salinity,
              cheeseType.maxSaltingSalinity,
              "salinidad",
              "la salmuera",
              "máximo",
              read.datetime
            ),

            failType: EnumFailTypes.saltingMaxSalinityAdmissible,
          });
        });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    /**
     * Checking maturation reads.
     */

    // Inadmissible
    const inadmissibleFailingMinMaturationTemperatureRead =
      sensorReads.maturation.find(
        (read) =>
          read.temperature <
          cheeseType.minMaturationTemperature -
            (maturationTemperatureTolerancePercentage / 100) *
              cheeseType.minMaturationTemperature
      );

    if (inadmissibleFailingMinMaturationTemperatureRead) {
      console.log(
        `[[Batch ${id} certification failed]]: Minimum maturation temperature failed: ${formatDateAndTime(
          inadmissibleFailingMinMaturationTemperatureRead.datetime
        )} --> Temperature: ${
          inadmissibleFailingMinMaturationTemperatureRead.temperature
        }
        --> Minimum allowed: ${cheeseType.minMaturationTemperature}`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: readsFailureMessage(
              inadmissibleFailingMinMaturationTemperatureRead.temperature,
              cheeseType.minMaturationTemperature,
              "temperatura",
              "la maduración",
              "mínimo",
              inadmissibleFailingMinMaturationTemperatureRead.datetime
            ),

            failType: EnumFailTypes.maturationMinTemperatureInadmissible,
          },
        ],
      };
    }

    // Admissible
    const admissibleFailingMinMaturationTemperatureReads =
      sensorReads.maturation.filter(
        (read) => read.temperature < cheeseType.minMaturationTemperature
      );

    if (admissibleFailingMinMaturationTemperatureReads.length > 0) {
      admissibleFailingMinMaturationTemperatureReads
        .slice(0, maxAdmissibleErrors - admissibleErrors.length + 1)
        .forEach((read) => {
          console.log(
            `[[Batch ${id} certification failed]]: Minimum maturation temperature failed: ${formatDateAndTime(
              read.datetime
            )}
            --> Temperature: ${read.temperature}
            --> Minimum allowed: ${cheeseType.minMaturationTemperature}`
          );
          admissibleErrors.push({
            message: readsFailureMessage(
              read.temperature,
              cheeseType.minMaturationTemperature,
              "temperatura",
              "la maduración",
              "mínimo",
              read.datetime
            ),

            failType: EnumFailTypes.maturationMinTemperatureAdmissible,
          });
        });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    // Inadmissible
    const inadmissibleFailingMaxMaturationTemperatureRead =
      sensorReads.maturation.find(
        (read) =>
          read.temperature >
          cheeseType.maxMaturationTemperature +
            (maturationTemperatureTolerancePercentage / 100) *
              cheeseType.maxMaturationTemperature
      );

    if (inadmissibleFailingMaxMaturationTemperatureRead) {
      console.log(
        `[[Batch ${id} certification failed]]: Maximum maturation temperature failed: ${formatDateAndTime(
          inadmissibleFailingMaxMaturationTemperatureRead.datetime
        )} --> Temperature: ${
          inadmissibleFailingMaxMaturationTemperatureRead.temperature
        }
        --> Maximum allowed: ${cheeseType.maxMaturationTemperature}`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: readsFailureMessage(
              inadmissibleFailingMaxMaturationTemperatureRead.temperature,
              cheeseType.maxMaturationTemperature,
              "temperatura",
              "la maduración",
              "máximo",
              inadmissibleFailingMaxMaturationTemperatureRead.datetime
            ),

            failType: EnumFailTypes.maturationMaxTemperatureInadmissible,
          },
        ],
      };
    }

    // Admissible
    const admissibleFailingMaxMaturationTemperatureReads =
      sensorReads.maturation.filter(
        (read) => read.temperature > cheeseType.maxMaturationTemperature
      );

    if (admissibleFailingMaxMaturationTemperatureReads.length > 0) {
      admissibleFailingMaxMaturationTemperatureReads
        .slice(0, maxAdmissibleErrors - admissibleErrors.length + 1)
        .forEach((read) => {
          console.log(
            `[[Batch ${id} certification failed]]: Maximum maturation temperature failed: ${formatDateAndTime(
              read.datetime
            )}
            --> Temperature: ${read.temperature}
            --> Maximum allowed: ${cheeseType.maxMaturationTemperature}`
          );
          admissibleErrors.push({
            message: readsFailureMessage(
              read.temperature,
              cheeseType.maxMaturationTemperature,
              "temperatura",
              "la maduración",
              "máximo",
              read.datetime
            ),

            failType: EnumFailTypes.maturationMaxTemperatureAdmissible,
          });
        });

      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    // Inadmissible
    const inadmissibleFailingMinMaturationHumidityRead =
      sensorReads.maturation.find(
        (read) =>
          read.humidity <
          cheeseType.minMaturationHumidity -
            (maturationHumidityTolerancePercentage / 100) *
              cheeseType.minMaturationHumidity
      );

    if (inadmissibleFailingMinMaturationHumidityRead) {
      console.log(
        `[[Batch ${id} certification failed]]: Minimum maturation humidity failed: ${formatDateAndTime(
          inadmissibleFailingMinMaturationHumidityRead.datetime
        )} --> Humidity: ${
          inadmissibleFailingMinMaturationHumidityRead.humidity
        }
        --> Minimum allowed: ${cheeseType.minMaturationHumidity}`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: readsFailureMessage(
              inadmissibleFailingMinMaturationHumidityRead.humidity,
              cheeseType.minMaturationHumidity,
              "humedad",
              "la maduración",
              "mínimo",
              inadmissibleFailingMinMaturationHumidityRead.datetime
            ),

            failType: EnumFailTypes.maturationMinHumidityInadmissible,
          },
        ],
      };
    }

    // Admissible
    const admissibleFailingMinMaturationHumidityReads =
      sensorReads.maturation.filter(
        (read) => read.humidity < cheeseType.minMaturationHumidity
      );

    if (admissibleFailingMinMaturationHumidityReads.length > 0) {
      admissibleFailingMinMaturationHumidityReads
        .slice(0, maxAdmissibleErrors - admissibleErrors.length + 1)
        .forEach((read) => {
          console.log(
            `[[Batch ${id} certification failed]]: Minimum maturation humidity failed: ${formatDateAndTime(
              read.datetime
            )}
            --> Humidity: ${read.humidity}
            --> Minimum allowed: ${cheeseType.minMaturationHumidity}`
          );
          admissibleErrors.push({
            message: readsFailureMessage(
              read.humidity,
              cheeseType.minMaturationHumidity,
              "humedad",
              "la maduración",
              "mínimo",
              read.datetime
            ),

            failType: EnumFailTypes.maturationMinHumidityAdmissible,
          });
        });
      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    // Inadmissible
    const inadmissibleFailingMaxMaturationHumidityRead =
      sensorReads.maturation.find(
        (read) =>
          read.humidity >
          cheeseType.maxMaturationHumidity +
            (maturationHumidityTolerancePercentage / 100) *
              cheeseType.maxMaturationHumidity
      );

    if (inadmissibleFailingMaxMaturationHumidityRead) {
      console.log(
        `[[Batch ${id} certification failed]]: Maximum maturation humidity failed: ${formatDateAndTime(
          inadmissibleFailingMaxMaturationHumidityRead.datetime
        )} --> Humidity: ${
          inadmissibleFailingMaxMaturationHumidityRead.humidity
        }
        --> Maximum allowed: ${cheeseType.maxMaturationHumidity}`
      );
      return {
        status: "CertificationFailed",
        certificationMessages: [
          {
            message: readsFailureMessage(
              inadmissibleFailingMaxMaturationHumidityRead.humidity,
              cheeseType.maxMaturationHumidity,
              "humedad",
              "la maduración",
              "máximo",
              inadmissibleFailingMaxMaturationHumidityRead.datetime
            ),

            failType: EnumFailTypes.maturationMaxHumidityInadmissible,
          },
        ],
      };
    }

    // Admissible
    const admissibleFailingMaxMaturationHumidityReads =
      sensorReads.maturation.filter(
        (read) => read.humidity > cheeseType.maxMaturationHumidity
      );

    if (admissibleFailingMaxMaturationHumidityReads.length > 0) {
      admissibleFailingMaxMaturationHumidityReads
        .slice(0, maxAdmissibleErrors - admissibleErrors.length + 1)
        .forEach((read) => {
          console.log(
            `[[Batch ${id} certification failed]]: Maximum maturation humidity failed: ${formatDateAndTime(
              read.datetime
            )}
    --> Humidity: ${read.humidity}
    --> Maximum allowed: ${cheeseType.maxMaturationHumidity}`
          );
          admissibleErrors.push({
            message: readsFailureMessage(
              read.humidity,
              cheeseType.maxMaturationHumidity,
              "humedad",
              "la maduración",
              "máximo",
              read.datetime
            ),

            failType: EnumFailTypes.maturationMaxHumidityAdmissible,
          });
        });
      if (admissibleErrors.length > maxAdmissibleErrors)
        return {
          status: "CertificationFailed",
          certificationMessages: admissibleErrors,
        };
    }

    return { status: "SuccessfullyCertified" };
  };

  /**
   * @throws DatabaseError
   */
  getBatchesPerMonth: IBatchController["getBatchesPerMonth"] = async () => {
    const today = new Date();
    today.setHours(23, 59, 59);

    const lastYear = new Date(
      today.getFullYear() - 1,
      (today.getMonth() + 1) % 12,
      1,
      0,
      0,
      0
    );

    const { batches } = await this.batchRepository.getBatchesByDateRange({
      minDate: lastYear,
      maxDate: today,
    });
    const batchesPerMonth: BatchesPerMonth = {};

    batches.forEach((batch) => {
      if (batch.curdInitDateTime) {
        const month = batch.curdInitDateTime.getMonth();
        if (batchesPerMonth[month]) batchesPerMonth[month]++;
        else batchesPerMonth[month] = 1;
      }
    });
    return batchesPerMonth;
  };

  /**
   * @throws DatabaseError
   */
  getCheeseTypesWeightStats: IBatchController["getCheeseTypesWeightStats"] =
    async () => await this.batchRepository.getCheeseTypesWeightStats();
}

export default BatchController;
