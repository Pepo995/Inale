import { useTranslate } from "@hooks";
import LabeledCheckbox from "@molecules/LabeledCheckbox";
import { FormTextInput } from "@atoms/TextInput";
import Typography from "@atoms/Typography";

const ForgotStepFormTemplate = ({
  stage,
  disabled,
}: {
  stage: "curd" | "curdEnd" | "salting" | "maturation" | "maturationEnd";
  disabled: boolean;
}) => {
  const { t } = useTranslate();
  if (stage === "maturationEnd") {
    return (
      <div
        className="flex flex-col gap-y-2"
        style={{
          opacity: disabled ? 0.2 : 1,
        }}
      >
        <FormTextInput
          type="text"
          name="maturationEndDate"
          label={t("forgotStep.form.endDate")}
          disabled={disabled}
        />
        <FormTextInput
          type="text"
          name="maturationEndTime"
          label={t("forgotStep.form.endTime")}
          disabled={disabled}
        />
        <FormTextInput
          type="number"
          name="weightAfterMaturation"
          label={t("forgotStep.form.weightAfterMaturation")}
          disabled={disabled}
        />
      </div>
    );
  }

  if (stage === "curdEnd") {
    return (
      <div className="flex flex-col gap-y-2">
        <FormTextInput
          type="text"
          name="curdEndDate"
          label={t("forgotStep.form.endDate")}
          disabled={disabled}
        />
        <FormTextInput
          type="text"
          name="curdEndTime"
          label={t("forgotStep.form.endTime")}
          disabled={disabled}
        />
        <LabeledCheckbox
          id="betweenCurdAndSalting"
          label={t("forgotStep.form.betweenCurdAndSalting")}
          name="betweenCurdAndSalting"
          disabled={disabled}
          labelSize="sm"
          checkboxSize="sm"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Typography weight="semibold">
        {t(`forgotStep.form.title.${stage}`)}
      </Typography>
      {stage === "curd" && (
        <FormTextInput
          type="number"
          name="initialVolume"
          label={t("forgotStep.form.initialVolume")}
          disabled={disabled}
        />
      )}
      {stage === "salting" && (
        <FormTextInput
          type="number"
          name="weightBeforeSalting"
          label={t("forgotStep.form.weightBeforeSalting")}
          disabled={disabled}
        />
      )}
      <FormTextInput
        type="text"
        name={`${stage}InitDate`}
        label={t("forgotStep.form.startDate")}
        disabled={disabled}
      />
      <FormTextInput
        type="text"
        name={`${stage}InitTime`}
        label={t("forgotStep.form.startTime")}
        disabled={disabled}
      />
      <LabeledCheckbox
        id={`${stage}InProgress`}
        label="En proceso"
        name={`${stage}InProgress`}
        disabled={disabled}
        labelSize="sm"
        checkboxSize="sm"
      />
    </div>
  );
};

export default ForgotStepFormTemplate;
