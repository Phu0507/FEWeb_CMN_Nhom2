// import PropTypes from "prop-types";
// // form
// import { useFormContext, Controller } from "react-hook-form";
// // @mui
// import { Autocomplete, TextField } from "@mui/material";

// // ----------------------------------------------------------------------

// RHFAutocomplete.propTypes = {
//   name: PropTypes.string,
//   label: PropTypes.string,
//   helperText: PropTypes.node,
// };

// export default function RHFAutocomplete({ name, label, helperText, ...other }) {
//   const { control, setValue } = useFormContext();

//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field, fieldState: { error } }) => (
//         <Autocomplete
//           {...field}
//           onChange={(event, newValue) =>
//             setValue(name, newValue, { shouldValidate: true })
//           }
//           renderInput={(params) => (
//             <TextField
//               label={label}
//               error={!!error}
//               helperText={error ? error?.message : helperText}
//               {...params}
//             />
//           )}
//           {...other}
//         />
//       )}
//     />
//   );
// }

import PropTypes from "prop-types";
import { useFormContext, Controller } from "react-hook-form";
import {
  Autocomplete,
  TextField,
  Avatar,
  Chip,
  Box,
  Typography,
} from "@mui/material";

RHFAutocomplete.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
  options: PropTypes.array,
};

export default function RHFAutocomplete({
  name,
  label,
  helperText,
  options = [],
  existingMembers = [],
  ...other
}) {
  const { control, setValue } = useFormContext();

  const isExistingMember = (option) =>
    existingMembers.some((member) => member._id === option._id);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          multiple={other.multiple}
          freeSolo={other.freeSolo}
          options={options}
          getOptionLabel={(option) => option.fullName || ""}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          onChange={(event, newValue) => {
            const filtered = newValue.filter((user) => !isExistingMember(user));
            setValue(name, filtered, { shouldValidate: true });
          }}
          renderOption={(props, option) => {
            const disabled = isExistingMember(option);

            return (
              <Box
                component="li"
                {...props}
                key={option._id}
                onMouseDown={(event) => {
                  if (disabled) {
                    event.preventDefault(); // Chặn chọn
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  opacity: disabled ? 0.5 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                  pointerEvents: disabled ? "none" : "auto", // Cũng có thể dùng dòng này
                }}
              >
                <Avatar src={option.avatar} alt={option.fullName} />
                <Typography variant="body2">
                  {option.fullName}
                  {disabled && (
                    <Typography
                      component="span"
                      color="success.main"
                      ml={1}
                      fontSize="0.75rem"
                    >
                      (Đã tham gia)
                    </Typography>
                  )}
                </Typography>
              </Box>
            );
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option._id}
                label={option.fullName}
                avatar={<Avatar src={option.avatar} />}
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={!!error}
              helperText={error ? error.message : helperText}
            />
          )}
          {...other}
        />
      )}
    />
  );
}
