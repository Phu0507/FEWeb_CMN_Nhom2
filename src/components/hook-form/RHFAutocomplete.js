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

import React from "react";
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
  ...other
}) {
  const { control, setValue } = useFormContext();

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
          onChange={(event, newValue) =>
            setValue(name, newValue, { shouldValidate: true })
          }
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              key={option._id}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Avatar src={option.avatar} alt={option.fullName} />
              <Typography variant="body2">{option.fullName}</Typography>
            </Box>
          )}
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
