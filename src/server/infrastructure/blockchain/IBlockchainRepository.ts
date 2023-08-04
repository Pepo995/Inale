import { type BlockchainCertificationInfo } from "@types";

export interface IBlockchainRepository {
  /**
   * Stores the certification in the blockchain and returns the
   * blockchainCertificationId to find that file later in the
   * blockchain.
   */
  storeCertification: (
    certificationInfo: BlockchainCertificationInfo
  ) => string;

  /**
   * Gets the certification info corresponding to the blockchainCertificationId
   * received.
   * @throws ConsistencyError
   */
  getCertification: (
    blockchainCertificationId: string
  ) => Promise<BlockchainCertificationInfo>;
}
