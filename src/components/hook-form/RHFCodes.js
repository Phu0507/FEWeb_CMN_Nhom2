import { useRef } from "react";
// form
import { useFormContext, Controller } from "react-hook-form";
// @mui
import { Stack, TextField } from "@mui/material";

export default function RHFCodes({ keyName = "", inputs = [], ...other }) {
  const codesRef = useRef(null);

  const { control } = useFormContext();

  const handleChangeWithNextField = (event, handleChange) => {
    const { maxLength, value, name } = event.target;

    const fieldIndex = name.replace(keyName, "");

    const fieldIntIndex = Number(fieldIndex);

    const nextfield = document.querySelector(
      `input[name=${keyName}${fieldIntIndex + 1}]`
    );

    if (value.length > maxLength) {
      event.target.value = value[0];
    }

    if (
      value.length >= maxLength &&
      fieldIntIndex < inputs.length &&
      nextfield !== null
    ) {
      nextfield.focus();
    }

    handleChange(event);
  };

  const handleKeyDown = (event, fieldIntIndex) => {
    if (
      event.key === "Backspace" &&
      event.target.value === "" &&
      fieldIntIndex > 1
    ) {
      const prevField = document.querySelector(
        `input[name=${keyName}${fieldIntIndex - 1}]`
      );
      if (prevField) {
        prevField.focus();
      }
    }
  };

  return (
    <Stack direction="row" spacing={2} justifyContent="center" ref={codesRef}>
      {inputs.map((name, index) => (
        <Controller
          key={name}
          name={`${keyName}${index + 1}`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              error={!!error}
              autoFocus={index === 0}
              placeholder="-"
              onChange={(event) => {
                handleChangeWithNextField(event, field.onChange);
              }}
              onFocus={(event) => event.currentTarget.select()}
              onKeyDown={(event) => handleKeyDown(event, index + 1)}
              InputProps={{
                sx: {
                  width: { xs: 36, sm: 56 },
                  height: { xs: 36, sm: 56 },
                  "& input": { p: 0, textAlign: "center" },
                },
              }}
              inputProps={{
                maxLength: 1,
                type: "number",
              }}
              {...other}
            />
          )}
        />
      ))}
    </Stack>
  );
}
