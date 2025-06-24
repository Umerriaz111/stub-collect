import React, { useEffect } from 'react'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
interface Option {
    value: any
    label: string
    disabled?: boolean
}

interface Props {
    placeholder: string
    options: Option[]
    // onChange: (value: number) => void
    onChange: (selectedOption: object) => void
    borderRadius?: string
    fontSize?: number
    selectedValue?: Option
    sx?: object
}

export default function GlobalSelect({ placeholder, options, onChange, borderRadius, fontSize, sx, selectedValue, ...restProps }: Props) {
    const [value, setValue] = React.useState(selectedValue?.value || '')
    const handleChange = (event: SelectChangeEvent<string | number>) => {
        const selectedOption = options.find((option) => option.value === event.target.value)
        setValue(event.target.value as number)
        selectedOption && onChange(selectedOption)
    }
    useEffect(() => {
        setValue(selectedValue?.value || '')
    }, [selectedValue])
    return (
        <FormControl sx={{ m: 0.5, minWidth: 100 }} size="small">
            <Select
                labelId="select-placeholder"
                id="select"
                value={value}
                onChange={handleChange}
                sx={{
                    borderRadius: borderRadius ? borderRadius : '30px',
                    fontSize: fontSize ? fontSize : '14px',
                    '& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input ': {
                        paddingY: '4.5px',
                        // paddingRight: '40px',
                    },
                    ...sx,
                }}
                {...restProps}
                displayEmpty
            >
                <MenuItem value="" disabled sx={{ fontSize: fontSize ? fontSize : '14px' }}>
                    {placeholder}
                </MenuItem>
                {options?.map((option, index) => (
                    <MenuItem
                        data-testid="select-option"
                        key={index}
                        value={option?.value}
                        sx={{
                            fontSize: fontSize ? fontSize : '14px',
                            color: option?.disabled ? 'text.light' : 'text.primary',
                            textTransform: 'none !important',
                        }}
                    >
                        {option?.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
