/**
 * 指定した Worker から、特定の条件を満たすメッセージを受信する Promise を返します。
 * @param worker - 対象の Worker インスタンス
 * @param filter - 受信メッセージの条件判定関数
 * @returns Promise<any> - 条件を満たすメッセージが届いたときに解決される Promise
 */
export const waitForWorkerMessage = (
  worker: Worker,
  filter: (data: any) => boolean
): Promise<any> => {
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (filter(event.data)) {
        worker.removeEventListener("message", handler);
        resolve(event.data);
      }
    };
    worker.addEventListener("message", handler);
  });
};
