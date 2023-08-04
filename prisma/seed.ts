import { PrismaClient, Certified } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { formatDate } from "../src/utils";

const prisma = new PrismaClient();

const main = async () => {
  await prisma.user.create({
    data: {
      email: "csayagues@eagerworks.com",
      isAdmin: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "fcarle@eagerworks.com",
      isAdmin: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "fborras@eagerworks.com",
      isAdmin: true,
    },
  });

  const dairyAmount = 20;
  const employeePerDairyAmount = 3;
  const sensorReadsPerDairy = 100;

  const defaultCheeseTypeParams = {
    minCurdTemperature: 10,
    maxCurdTemperature: 15,
    minCurdMinutes: 4 * 60,
    maxCurdMinutes: 8 * 60,
    minSaltingSalinity: 10,
    maxSaltingSalinity: 15,
    minSaltingMinutes: 4 * 60,
    maxSaltingMinutes: 8 * 60,
    minMaturationTemperature: 10,
    maxMaturationTemperature: 15,
    minMaturationHumidity: 10,
    maxMaturationHumidity: 15,
    minMaturationMinutes: 18 * 24 * 60,
    maxMaturationMinutes: 22 * 24 * 60,
  };

  const cheeseTypes = [
    {
      name: "Cheddar",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 1`,
      registrationCode: `Reg 1`,
    },
    {
      name: "Gouda",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 2`,
      registrationCode: `Reg 2`,
      minMaturationMinutes: 28 * 24 * 60,
      maxMaturationMinutes: 32 * 24 * 60,
    },
    {
      name: "Mozzarella",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 3`,
      registrationCode: `Reg 3`,
    },
    {
      name: "Colonia",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 4`,
      registrationCode: `Reg 4`,
    },
    {
      name: "Parmesano",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 5`,
      registrationCode: `Reg 5`,
    },
    {
      name: "Cheddar light",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 6`,
      registrationCode: `Reg 6`,
    },
    {
      name: "Gouda light",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 7`,
      registrationCode: `Reg 7`,
    },
    {
      name: "Mozzarella light",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 8`,
      registrationCode: `Reg 8`,
    },
    {
      name: "Colonia light",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 9`,
      registrationCode: `Reg 9`,
    },
    {
      name: "Parmesano light",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 10`,
      registrationCode: `Reg 10`,
    },
    {
      name: "Cheddar sin sal",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 11`,
      registrationCode: `Reg 11`,
    },
    {
      name: "Gouda sin sal",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 12`,
      registrationCode: `Reg 12`,
    },
    {
      name: "Mozzarella sin sal",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 13`,
      registrationCode: `Reg 13`,
    },
    {
      name: "Colonia sin sal",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 14`,
      registrationCode: `Reg 14`,
    },
    {
      name: "Parmesano sin sal",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 15`,
      registrationCode: `Reg 15`,
    },
    {
      name: "Danbo",
      ...defaultCheeseTypeParams,
      bromatologicalForm: `Brom 16`,
      registrationCode: `Reg 16`,
    },
  ];

  const producerIds = await prisma.$transaction([
    ...Array.from({ length: dairyAmount }, (_, index) =>
      prisma.user.create({
        data: {
          id: `P${index}`,
          name: `Producer${index}`,
        },
        select: {
          id: true,
        },
      })
    ),
    prisma.user.create({
      data: {
        id: `OtherProducer`,
        name: `Other Producer`,
      },
      select: {
        id: true,
      },
    }),
  ]);

  const dairyRuts = await prisma.$transaction([
    ...Array.from({ length: dairyAmount }, (_, index) =>
      prisma.dairy.create({
        data: {
          rut: index + 111111111111,

          producerId: producerIds[index]?.id ?? "1",
          name: `Quesería${index}`,
          companyNumber: 100 + index,
          address: `Ruta 1, KM ${150 + index}`,

          registrationCode: `M${7430 + index}`,
          bromatologicalRegistry: index + 30686950,
          dicoseNumber: index + 111111,
          contactPhone: `09${Math.round(Math.random() * 9)}${111111 + index}`,
          createdAt: new Date(
            2000 + Math.round(Math.random() * 22),
            Math.round(Math.random() * 11),
            Math.round(Math.random() * 25)
          ),
          enabledSince: new Date(
            2000 + Math.round(Math.random() * 22),
            Math.round(Math.random() * 11),
            Math.round(Math.random() * 25)
          ),
          endorsementDate: new Date(
            2000 + Math.round(Math.random() * 22),
            Math.round(Math.random() * 11),
            Math.round(Math.random() * 25)
          ),
        },
        select: {
          rut: true,
        },
      })
    ),
    prisma.dairy.create({
      data: {
        rut: 1, // To test RUT: 000000000001

        producerId: "OtherProducer",
        name: `Quesería Con Rut 1`,
        companyNumber: 10001,
        address: `Ruta 5, Canelones`,

        registrationCode: `M8000`,
        bromatologicalRegistry: 30686949,
        dicoseNumber: 1,
        contactPhone: `091000000`,
        createdAt: new Date(
          2000 + Math.round(Math.random() * 22),
          Math.round(Math.random() * 11),
          Math.round(Math.random() * 25)
        ),
        enabledSince: new Date(
          2000 + Math.round(Math.random() * 22),
          Math.round(Math.random() * 11),
          Math.round(Math.random() * 25)
        ),
        endorsementDate: new Date(
          2000 + Math.round(Math.random() * 22),
          Math.round(Math.random() * 11),
          Math.round(Math.random() * 25)
        ),
        department: "SanJose",
      },
      select: {
        rut: true,
      },
    }),
  ]);

  /* const employeeDocuments =  */ await prisma.$transaction(
    Array.from({ length: employeePerDairyAmount * dairyAmount }, (_, index) =>
      prisma.employee.create({
        data: {
          document: 12345678 + index,
          name: `Empleado${index}`,
          dairyRut: dairyRuts[Math.round(Math.random() * (dairyAmount - 1))]
            ?.rut as bigint,
        },
        select: {
          document: true,
        },
      })
    )
  );

  await prisma.cheeseType.createMany({
    data: cheeseTypes,
    skipDuplicates: true,
  });

  await prisma.dairyCheeseType.createMany({
    data: cheeseTypes.map((cheeseType) => ({
      dairyRut: 1,
      cheeseTypeName: cheeseType.name,
    })),
    skipDuplicates: true,
  });

  await prisma.dairyCheeseType.createMany({
    data: [
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        cheeseTypeName: "Gouda",
      },
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        cheeseTypeName: "Danbo",
      },
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        cheeseTypeName: "Mozzarella",
      },
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[1]?.rut as bigint,
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        cheeseTypeName: "Gouda",
      },
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[3]?.rut as bigint,
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[3]?.rut as bigint,
        cheeseTypeName: "Mozzarella",
      },
      {
        dairyRut: dairyRuts[18]?.rut as bigint,
        cheeseTypeName: "Cheddar",
      },
      {
        dairyRut: dairyRuts[18]?.rut as bigint,
        cheeseTypeName: "Gouda",
      },
      {
        dairyRut: dairyRuts[18]?.rut as bigint,
        cheeseTypeName: "Mozzarella",
      },
      {
        dairyRut: dairyRuts[19]?.rut as bigint,
        cheeseTypeName: "Colonia",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.batch.createMany({
    data: [
      // ---Dairy 0's batches---
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        id: "1",
        // base64 id: "MQ==",
        cheeseTypeName: "Cheddar",
        started: true,
      },
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        id: "200",
        batchName: "Un lote certificable finalizando 16/07/2023 15:00hs",
        // base64 id: "MjAw",
        cheeseTypeName: "Gouda",
        started: true,
        curdInitDateTime: new Date(2023, 5, 16, 6, 30),
        curdEndDateTime: new Date(2023, 5, 16, 12, 0),
        saltingInitDateTime: new Date(2023, 5, 16, 12, 30),
        maturationInitDateTime: new Date(2023, 5, 16, 18, 30),
      },
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        cheeseTypeName: "Gouda",
      },
      {
        id: "300",
        // base64 id: "MzAw",
        dairyRut: dairyRuts[0]?.rut as bigint,
        cheeseTypeName: "Gouda",
      },
      {
        id: "301",
        // base64 id: "MzAx",
        dairyRut: dairyRuts[0]?.rut as bigint,
        cheeseTypeName: "Gouda",
      },
      {
        id: "302",
        // base64 id: "MzAy",
        dairyRut: dairyRuts[0]?.rut as bigint,
        cheeseTypeName: "Gouda",
      },
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        id: "4",
        batchName:
          "El lote de la tarde, certificable finalizando 06/07/2023 09:00hs",
        initialVolume: 1200,
        weightBeforeSalting: 150,
        // base64 id: "NA==",
        started: true,
        curdInitDateTime: new Date(2023, 5, 16, 6, 30),
        curdEndDateTime: new Date(2023, 5, 16, 12, 0),
        saltingInitDateTime: new Date(2023, 5, 16, 12, 30),
        maturationInitDateTime: new Date(2023, 5, 16, 18, 30),
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        id: "155",
        batchName:
          "Lote para mostrar tolerancia finalizando 09/07/2023 09:00hs",
        initialVolume: 1200,
        weightBeforeSalting: 150,
        // base64 id: "MTU1",
        started: true,
        curdInitDateTime: new Date(2023, 5, 16, 3, 30),
        curdEndDateTime: new Date(2023, 5, 16, 12, 0),
        saltingInitDateTime: new Date(2023, 5, 16, 12, 30),
        maturationInitDateTime: new Date(2023, 5, 16, 18, 30),
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[0]?.rut as bigint,
        id: "156",
        batchName:
          "Lote para mostrar tolerancia finalizando 09/07/2023 09:00hs",
        initialVolume: 1200,
        weightBeforeSalting: 150,
        // base64 id: "MTU2",
        started: true,
        curdInitDateTime: new Date(2023, 5, 16, 3, 30),
        curdEndDateTime: new Date(2023, 5, 16, 12, 0),
        saltingInitDateTime: new Date(2023, 5, 16, 12, 30),
        maturationInitDateTime: new Date(2023, 5, 16, 18, 30),
        cheeseTypeName: "Colonia",
      },
      // ---Dairy 1's batches---
      {
        dairyRut: dairyRuts[1]?.rut as bigint,
        id: "157",
        batchName:
          "Lote para mostrar tolerancia finalizando 09/07/2023 09:00hs",
        initialVolume: 1200,
        weightBeforeSalting: 150,
        // base64 id: "MTU3",
        started: true,
        curdInitDateTime: new Date(2023, 5, 16, 3, 30),
        curdEndDateTime: new Date(2023, 5, 16, 12, 0),
        saltingInitDateTime: new Date(2023, 5, 16, 12, 30),
        maturationInitDateTime: new Date(2023, 5, 16, 18, 30),
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[1]?.rut as bigint,
        id: "158",
        batchName:
          "Lote para mostrar tolerancia finalizando 09/07/2023 09:00hs",
        initialVolume: 1200,
        weightBeforeSalting: 150,
        // base64 id: "MTU4",
        started: true,
        curdInitDateTime: new Date(2023, 5, 16, 3, 30),
        curdEndDateTime: new Date(2023, 5, 16, 12, 0),
        saltingInitDateTime: new Date(2023, 5, 16, 12, 30),
        maturationInitDateTime: new Date(2023, 5, 16, 18, 30),
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[1]?.rut as bigint,
        id: "2",
        // base64 id: "Mg==",
        cheeseTypeName: "Colonia",
        started: true,
        curdInitDateTime: new Date(2023, 5, 16, 6, 30),
        curdEndDateTime: new Date(2023, 5, 16, 12, 0),
        saltingInitDateTime: new Date(2023, 5, 16, 12, 30),
        maturationInitDateTime: new Date(2023, 5, 16, 18, 30),
        maturationEndDateTime: new Date(2023, 6, 6, 8, 0),
        certified: "SuccessfullyCertified",
      },
      {
        dairyRut: dairyRuts[1]?.rut as bigint,
        cheeseTypeName: "Colonia",
      },
      // ---Dairy 2's batches---
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        id: "3",
        // base64 id: "Mw==",
        cheeseTypeName: "Gouda",
        started: true,
        curdInitDateTime: new Date(2023, 5, 16, 6, 30),
        curdEndDateTime: new Date(2023, 5, 16, 12, 0),
        saltingInitDateTime: new Date(2023, 5, 16, 12, 30),
        maturationInitDateTime: new Date(2023, 5, 16, 18, 30),
        maturationEndDateTime: new Date(2023, 6, 6, 8, 0),
        certified: "CertificationFailed",
        certificationMessage: JSON.stringify([
          { message: "test1", failType: 1 },
          { message: "test1", failType: 1 },
          { message: "test1", failType: 1 },
          { message: "test1", failType: 1 },
          { message: "test1", failType: 1 },
          { message: "test1", failType: 1 },
          { message: "test2", failType: 2 },
          { message: "test3", failType: 3 },
          { message: "test4", failType: 4 },
          { message: "test5", failType: 5 },
          { message: "test6", failType: 6 },
          { message: "test7", failType: 7 },
          { message: "test8", failType: 8 },
          { message: "test9", failType: 9 },
          { message: "test10", failType: 10 },
          { message: "test11", failType: 11 },
          { message: "test12", failType: 12 },
          { message: "test13", failType: 13 },
        ]),
      },
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        id: "3.1",
        // base64 id: "Mw==",
        cheeseTypeName: "Gouda",
        started: true,
        curdInitDateTime: new Date(2023, 5, 16, 6, 30),
        curdEndDateTime: new Date(2023, 5, 16, 12, 0),
        saltingInitDateTime: new Date(2023, 5, 16, 12, 30),
        maturationInitDateTime: new Date(2023, 5, 16, 18, 30),
        maturationEndDateTime: new Date(2023, 6, 6, 8, 0),
        certified: "CertificationFailed",
        certificationMessage: JSON.stringify([
          { message: "test1", failType: 10 },
          { message: "test1", failType: 10 },
          { message: "test1", failType: 10 },
          { message: "test1", failType: 10 },
          { message: "test1", failType: 10 },
          { message: "test1", failType: 10 },
        ]),
      },
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        id: "4",
        cheeseTypeName: "Colonia",
      },
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        id: "5",
        cheeseTypeName: "Colonia",
        started: true,
      },
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        id: "6",
        cheeseTypeName: "Colonia",
        started: true,
      },
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        id: "7",
        cheeseTypeName: "Colonia",
        started: true,
      },
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        id: "8",
        cheeseTypeName: "Colonia",
        started: true,
      },
      {
        dairyRut: dairyRuts[2]?.rut as bigint,
        id: "9",
        cheeseTypeName: "Colonia",
        started: true,
      },
    ],
    skipDuplicates: true,
  });

  /**
   * Curd sensor reads.
   */
  await prisma.$transaction(
    Array.from({ length: sensorReadsPerDairy }, (_, index) =>
      prisma.curdSensorData.create({
        data: {
          datetime: new Date(2023, 6, 12 + index, 6, 15 + index * 5),
          dairyRut: dairyRuts[0]?.rut as bigint,
          temperature: 10 + Math.round(Math.random() * 5),
        },
      })
    )
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.curdSensorData.create({
            data: {
              datetime: new Date(2023, 6, 14, 6, 15 + index * 5),
              dairyRut: dairyRuts[1]?.rut as bigint,
              temperature: 10 + Math.round(Math.random() * 5),
            },
          })
        )
      )
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.curdSensorData.create({
            data: {
              datetime: new Date(2023, 6, 16, 6, 15 + index * 5),
              dairyRut: dairyRuts[2]?.rut as bigint,
              temperature: 10 + Math.round(Math.random() * 5),
            },
          })
        )
      )
      // Reads for batches 155 and 156 with tolerance.
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.curdSensorData.create({
            data: {
              datetime: new Date(2023, 5, 16, 3, 15 + index),
              dairyRut: dairyRuts[0]?.rut as bigint,
              temperature: 10 + Math.round(Math.random() * 2),
            },
          })
        )
      )
      // Reads for batches 157 and 158 with tolerance.
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.curdSensorData.create({
            data: {
              datetime: new Date(2023, 5, 16, 3, 15 + index),
              dairyRut: dairyRuts[1]?.rut as bigint,
              temperature: 9.9 + Math.random() * 0.1,
            },
          })
        )
      )
  );

  /**
   * Salting sensor reads.
   */
  await prisma.$transaction(
    Array.from({ length: sensorReadsPerDairy }, (_, index) =>
      prisma.saltingSensorData.create({
        data: {
          datetime: new Date(2023, 6, 15 + index, 12, 20 + index * 5),
          dairyRut: dairyRuts[0]?.rut as bigint,
          salinity: 10 + Math.round(Math.random() * 5),
        },
      })
    )
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.saltingSensorData.create({
            data: {
              datetime: new Date(2023, 6, 13 + index, 12, 20 + index * 5),
              dairyRut: dairyRuts[1]?.rut as bigint,
              salinity: 16 + Math.round(Math.random() * 5),
            },
          })
        )
      )
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.saltingSensorData.create({
            data: {
              datetime: new Date(2023, 6, 12 + index, 12, 20 + index * 5),
              dairyRut: dairyRuts[2]?.rut as bigint,
              salinity: 22 + Math.round(Math.random() * 5),
            },
          })
        )
      )
      // Reads for batches 155 and 156 with tolerance.
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.saltingSensorData.create({
            data: {
              datetime: new Date(2023, 5, 16, 12, index),
              dairyRut: dairyRuts[0]?.rut as bigint,
              salinity: 10 + Math.round(Math.random() * 2),
            },
          })
        )
      )
      // Reads for batches 157 and 158 with tolerance.
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.saltingSensorData.create({
            data: {
              datetime: new Date(2023, 5, 16, 12, index),
              dairyRut: dairyRuts[1]?.rut as bigint,
              salinity: 15.1 + Math.random() * 0.1,
            },
          })
        )
      )
  );

  /**
   * Maturation sensor reads.
   */
  await prisma.$transaction(
    Array.from({ length: sensorReadsPerDairy }, (_, index) =>
      prisma.maturationSensorData.create({
        data: {
          datetime: new Date(2023, 6, 6, 10 + index, 15 + index * 5),
          dairyRut: dairyRuts[0]?.rut as bigint,
          temperature: 10 + Math.round(Math.random() * 5),
          humidity: 10 + Math.round(Math.random() * 5),
        },
      })
    )
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.maturationSensorData.create({
            data: {
              datetime: new Date(2023, 6, 6, 9 + index, 15 + index * 5),
              dairyRut: dairyRuts[1]?.rut as bigint,
              temperature: 10 + Math.round(Math.random() * 5),
              humidity: 10 + Math.round(Math.random() * 5),
            },
          })
        )
      )
      .concat(
        Array.from({ length: sensorReadsPerDairy }, (_, index) =>
          prisma.maturationSensorData.create({
            data: {
              datetime: new Date(2023, 6, 6, 13 + index, 15 + index * 5),
              dairyRut: dairyRuts[2]?.rut as bigint,
              temperature: 10 + Math.round(Math.random() * 5),
              humidity: 10 + Math.round(Math.random() * 5),
            },
          })
        )
      )
  );

  // Sensor reads for reports
  await prisma.$transaction(
    Array.from({ length: sensorReadsPerDairy }, (_, index) =>
      prisma.curdSensorData.create({
        data: {
          datetime: new Date(
            2023,
            6,
            12 + index + (Math.random() > 0.5 ? 1 : 0),
            6,
            15 + index * 5
          ),
          dairyRut: dairyRuts[10]?.rut as bigint,
          temperature: 10 + Math.round(Math.random() * 5),
        },
      })
    )
  );
  await prisma.$transaction(
    Array.from({ length: sensorReadsPerDairy }, (_, index) =>
      prisma.saltingSensorData.create({
        data: {
          datetime: new Date(
            2023,
            6,
            15 + index + (Math.random() > 0.5 ? 1 : 0),
            12,
            20 + index * 5
          ),
          dairyRut: dairyRuts[10]?.rut as bigint,
          salinity: 10 + Math.round(Math.random() * 5),
        },
      })
    )
  );

  await prisma.$transaction(
    Array.from({ length: sensorReadsPerDairy }, (_, index) =>
      prisma.maturationSensorData.create({
        data: {
          datetime: new Date(
            2023,
            6,
            15 + index + (Math.random() > 0.5 ? 1 : 0),
            12,
            20 + index * 5
          ),
          dairyRut: dairyRuts[10]?.rut as bigint,
          temperature: 10 + Math.round(Math.random() * 5),
          humidity: 10 + Math.round(Math.random() * 5),
        },
      })
    )
  );

  // Create many started batches
  const batches = [];
  for (let i = 1; i < 100; i++) {
    const date = faker.date.past();
    const prefix = date.getHours() >= 12 ? "T" : "M";

    batches.push({
      dairyRut:
        i < 30
          ? (dairyRuts[0]?.rut as bigint)
          : i < 50
          ? (dairyRuts[1]?.rut as bigint)
          : (dairyRuts[2]?.rut as bigint),
      id: `${i}`,
      cheeseTypeName: i < 30 ? "Mozzarella" : i < 50 ? "Colonia" : "Danbo",
      started: true,
      curdInitDateTime: date,
      batchName: `${prefix}-${formatDate(date) as string}`,
    });
  }

  //Create 32 certified and 18 failed certified batches
  for (let i = 100; i < 150; i++) {
    {
      const date = faker.date.past();
      const prefix = date.getHours() >= 12 ? "T" : "M";

      batches.push({
        dairyRut:
          i < 132
            ? (dairyRuts[0]?.rut as bigint)
            : (dairyRuts[1]?.rut as bigint),
        id: `${i}`,
        cheeseTypeName: i < 132 ? "Danbo" : "Colonia",
        started: true,
        curdInitDateTime: date,
        batchName: `${prefix}-${formatDate(date) as string}`,
        initialVolume: 1500 + i,
        weightBeforeSalting: 1300 + i,
        weightAfterMaturation: 1000 + i,
        maturationEndDateTime: new Date(2023, 6, 6, 8, 0),
        certified:
          i < 132
            ? Certified.SuccessfullyCertified
            : Certified.CertificationFailed,
      });
    }
  }

  await prisma.batch.createMany({
    data: batches,
    skipDuplicates: true,
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
