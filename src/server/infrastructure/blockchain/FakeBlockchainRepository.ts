import { type Prisma, type PrismaClient } from "@prisma/client";
import { type IBlockchainRepository } from "./IBlockchainRepository";
import { BlockchainError } from "@errors";
import { type BlockchainCertificationInfo } from "@types";
import { convertBatchToOutside } from "../converters";

export default class FakeBlockchainRepository implements IBlockchainRepository {
  private ctx;
  constructor(ctx: {
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
  }) {
    this.ctx = ctx;
  }

  /**
   * Discarding parameter info (certificationInfo) since it's already in the database
   * blockchainCertificationId = batchId since we're not really storing info in a blockchain yet.
   */
  storeCertification: IBlockchainRepository["storeCertification"] = (
    certificationInfo: BlockchainCertificationInfo
  ) => {
    console.log(
      "[FakeBlockchainRepository::storeCertification]: simulating information storage in a blockchain for: ",
      certificationInfo
    );
    return certificationInfo.id;
  };

  /**
   * - The intention of this function is to fake getting the certification data from the blockchain
   * - That is why we get the data from the DB, so when blockchain is implemented and integrated
   * we only have to substitute getting data from DB to getting data from blockchain
   * @throws ConsistencyError
   */
  getCertification: IBlockchainRepository["getCertification"] = async (
    blockchainCertificationId: string
  ) => {
    const data = await this.ctx.prisma.batch.findUnique({
      where: { id: blockchainCertificationId },
      include: { dairyCheeseType: { include: { dairy: true } } },
    });

    if (!data) throw new BlockchainError("Batch not found");

    const {
      dairyCheeseType: { dairy },
      ...batch
    } = data;

    const convertedBatch = convertBatchToOutside(batch);

    if (!convertedBatch.maturationEndDateTime)
      throw new BlockchainError("Batch not finished");

    const certificationInfo: BlockchainCertificationInfo = {
      ...convertedBatch,
      batchName: convertedBatch.batchName ?? undefined,
      cheeseType: data.cheeseTypeName,
      dairyName: dairy.name,
      dairyRut: Number(dairy.rut),
      status: convertedBatch.certified,
      certificationDate: convertedBatch.maturationEndDateTime,
    };
    console.log(
      `[FakeBlockchainRepository::getCertification]: simulating information retrieving from a blockchain for blockchainCertificationId ${blockchainCertificationId}:`,
      certificationInfo
    );
    return certificationInfo;
  };
}
