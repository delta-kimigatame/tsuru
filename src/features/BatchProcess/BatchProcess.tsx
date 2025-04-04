import { Button } from "@mui/material";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import set from "lodash/set";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DynamicBatchProcessInput } from "../../components/BatchProcess/DynamicBatchProcessInput";
import { BasePaper } from "../../components/common/BasePaper";
import { BaseBatchProcess } from "../../lib/BaseBatchProcess";
import { LOG } from "../../lib/Logging";
import { useMusicProjectStore } from "../../store/musicProjectStore";
import { executeBatchProcess } from "../../utils/batchProcess";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export const BatchProcess: React.FC<BatchProcessProps> = (props) => {
  const { notes, setNotes, vb } = useMusicProjectStore();
  const { t } = useTranslation();
  type FormState = typeof props.batchprocess.initialOptions;
  type Action = {
    type: "UPDATE_FIELD";
    key: NestedKeyOf<FormState>;
    value: any;
  };
  const formReducer = (state: FormState, action: Action): FormState => {
    switch (action.type) {
      case "UPDATE_FIELD": {
        // cloneDeep によりオブジェクト全体のディープコピーを作成
        const newState = cloneDeep(state);
        // lodash の set を使って、action.key（ドット記法）に対応する箇所を更新
        set(newState, action.key, action.value);
        return newState;
      }
      default:
        return state;
    }
  };
  /** フォーム全体の状態 */
  const [formState, dispatch] = React.useReducer(
    formReducer,
    props.batchprocess.initialOptions
  );

  /**
   * フォーム要素を更新する際の処理
   */
  const handleFieldChange = useCallback(
    (key: NestedKeyOf<FormState>, value: any) => {
      LOG.info(`formの値の更新。key:${key}、value:${value}`, `BatchProcess`);
      dispatch({ type: "UPDATE_FIELD", key, value });
    },
    []
  );

  /**
   * 実行ボタンを押した際の処理
   */
  const handleButtonClick = () => {
    LOG.debug(`click`, `BatchProcess`);
    props.batchprocess.vb = vb;
    executeBatchProcess<FormState>(
      props.selectedNotesIndex,
      notes,
      setNotes,
      vb,
      props.batchprocess.process,
      formState
    );
    if (props.handleClose !== undefined) props.handleClose();
  };

  return (
    <>
      {props.batchprocess.ui.map((ui) =>
        "items" in ui ? (
          <BasePaper title={t(ui.titleKey)}>
            {ui.items.map((item) => (
              <DynamicBatchProcessInput
                config={item}
                value={get(formState, item.key)}
                onChange={handleFieldChange}
              />
            ))}
          </BasePaper>
        ) : (
          <DynamicBatchProcessInput
            config={ui}
            value={get(formState, ui.key)}
            onChange={handleFieldChange}
          />
        )
      )}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleButtonClick}
      >
        {t("batchprocess.process")}
      </Button>
    </>
  );
};

export interface BatchProcessProps {
  batchprocess: BaseBatchProcess;
  selectedNotesIndex: number[];
  handleClose?: () => void;
}
