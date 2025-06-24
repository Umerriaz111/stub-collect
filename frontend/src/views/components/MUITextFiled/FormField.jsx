import React from 'react';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { FormHelperText } from '@mui/material';

const FormField = ({
  id,
  type,
  name,
  size,
  error,
  isTouched,
  handleChange,
  fullWidth = true,
  options,
  password,
  icon,
  InputProps,
  style,
  selectbutton,
  SelectProps,
  sx,
  disabled,
  characterCount = 500,
  onChange,
  rows,
  isZeroValueAllowed,
  optionsValueType,
  placeholder,
  isPackageTypeDropdown,
  isListView,
  ...otherProps
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const baseProps = {
    id,
    name: name || id,
    fullWidth,
    size: size || 'small',
    disabled,
    ...otherProps,
  };

  const handleInputChange = e => {
    let inputValue = e.target.value;

    if (type === 'number') {
      if (inputValue.includes('-')) {
        return;
      }

      if (!/^\d*\.?\d{0,5}$/.test(inputValue) && !isZeroValueAllowed) {
        return;
      }
    }

    if (typeof handleChange === 'function') handleChange(e);
    if (typeof onChange === 'function') onChange(e);
  };

  const textFieldProps = {
    ...baseProps,
    onChange: handleInputChange,
    type: showPassword ? 'text' : type,
    InputProps: {
      style: {
        fontSize: style?.fontSize || '14px',
        // backgroundColor: disabled ? '#616161' : '',
        borderRadius: '16px',
        padding: '4.5 10px',
        ...InputProps?.style,
      },
      ...InputProps,
    },
    InputLabelProps: {
      style: { fontSize: '16px' },
    },
    error: isTouched && !!error,
    helperText: isTouched && error ? error : undefined,
  };

  const defaultOption = options?.find(option => option?.isDefault); // for package type dropdown usage only

  if (type === 'select') {
    return (
      <FormControl variant="outlined" {...baseProps} sx={sx}>
        <InputLabel id={`${id}-label`}>{name}</InputLabel>
        <Select
          id={id}
          name={name || id}
          labelId={`${id}-label`}
          label={name}
          value={textFieldProps.value || ''}
          onChange={handleInputChange}
          // MenuProps={{ PaperProps: { style: { maxHeight: '250px' } } }}
          {...SelectProps}
          displayEmpty
          sx={{
            borderRadius: '30px',
            fontSize: '14px',
            // backgroundColor: disabled ? 'dim.main' : '',

            ...sx,
            '.MuiNativeSelect-select': {
              padding: isPackageTypeDropdown && isListView && '4.5px 10px',
            },
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: window.innerHeight / 2, // Half of the screen height
                overflowY: 'auto',
              },
            },
          }}
          native={isPackageTypeDropdown}
        >
          {isPackageTypeDropdown
            ? // Native select (using <option>)
              [
                !textFieldProps.value && (
                  <option key="placeholder" value="" disabled>
                    {placeholder}
                  </option>
                ),

                defaultOption?.label && (
                  <optgroup
                    label="Customized Packages"
                    style={{ fontSize: '14px', color: 'grey' }}
                    key="default"
                    value={defaultOption.id}
                  >
                    <option style={{ fontSize: '14px', color: '#000' }}>Customized Box</option>
                  </optgroup>
                ),
                <optgroup
                  key="packages"
                  style={{ fontSize: '14px', color: 'grey' }}
                  label="Flat Rate Packages"
                >
                  {options
                    ?.filter(({ isDefault }) => !isDefault)
                    .map(({ id, value, label }, index) => (
                      <option
                        style={{ fontSize: '14px', color: '#000' }}
                        key={index}
                        value={optionsValueType === 'id' ? id : value}
                      >
                        {label}
                      </option>
                    ))}
                </optgroup>,
              ].filter(Boolean) // Remove any falsey values from the array
            : // Non-native select (using MenuItem)
              [
                !textFieldProps.value && (
                  <MenuItem key="placeholder" value="" disabled>
                    {placeholder}
                  </MenuItem>
                ),
                ...options?.map((option, index) => (
                  <MenuItem
                    key={index}
                    value={optionsValueType === 'id' ? option?.id : option.value}
                  >
                    {option.label}
                  </MenuItem>
                )),
              ]}
        </Select>
        {/* {selectbutton && (
                    <Typography sx={{ position: 'sticky', bottom: 0, width: '100%', backgroundColor: 'white' }}>{selectbutton}</Typography>
                )} */}
        {isTouched && error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
    );
  }

  return (
    <TextField
      {...textFieldProps}
      style={style}
      sx={sx}
      inputProps={{
        maxLength: characterCount,
        ...textFieldProps.InputProps,
      }}
      multiline={type === 'textarea'}
      rows={type === 'textarea' ? (rows ? rows : 4) : 1}
    />
  );
};

export default FormField;
