import type IGetTokenByBatchId from "./IGetTokenByBatchId";
import type IGetBatchIdByToken from "./IGetBatchIdByToken";

export default class TokenController
  implements IGetBatchIdByToken, IGetTokenByBatchId
{
  getTokenByBatchId: IGetTokenByBatchId["getTokenByBatchId"] = (id: string) =>
    btoa(id);

  getBatchIdByToken: IGetBatchIdByToken["getBatchIdByToken"] = (
    token: string
  ) => atob(token);
}
