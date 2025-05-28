import PropTypes from "prop-types";
// form
import { useFormContext, Controller } from "react-hook-form";
// @mui
import {
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Chip,
  Typography,
} from "@mui/material";

// ----------------------------------------------------------------------

RHFAutocomplete.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
};

export default function RHFAutocomplete({ name, label, helperText, ...other }) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          onChange={(event, newValue) =>
            setValue(name, newValue, { shouldValidate: true })
          }
          multiple={other.multiple}
          disableCloseOnSelect={other.disableCloseOnSelect}
          isOptionEqualToValue={other.isOptionEqualToValue}
          getOptionLabel={other.getOptionLabel}
          getOptionDisabled={other.getOptionDisabled}
          options={other.options}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Avatar src={option.avatar} alt={option.fullName} />
              <Typography>
                {option.fullName}
                {option.participated && (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: "success.main", ml: 0.5 }}
                  >
                    (Participated)
                  </Typography>
                )}
              </Typography>
            </Box>
          )}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option._id}
                avatar={<Avatar src={option.avatar} />}
                label={option.fullName}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              label={label}
              error={!!error}
              helperText={error ? error?.message : helperText}
              {...params}
            />
          )}
          {...other}
        />
      )}
    />
  );
}
