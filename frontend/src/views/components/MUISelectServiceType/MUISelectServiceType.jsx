import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { Box, Checkbox, Chip, Divider, Grid, ListItemButton, MenuItem, Popover, Tooltip, Typography, Radio } from '@mui/material'
import { getChipBgColor, getChipTextColor } from '../../../core/utils/helpers'

export default function MUISelectServiceType({
    onClick,
    placeholder,
    anchorEl,
    handleClose,
    options,
    dropdownData = [],
    onChange,
    borderRadius,
    fontSize,
    sx,
    selectedValue,
    handleRateSelection,
    order,
    serviceTypeCode,
    disabled,
    ...restProps
}) {
    const handleListItemClick = async (option, event) => {
        event.stopPropagation()
        try {
            await handleRateSelection(option, order)
        } catch (error) {
            console.error('Failed to fetch item details', error)
        }
    }

    return (
        <FormControl sx={{ m: 0.5 }} size="medium">
            <Select
                labelId="select-placeholder"
                id="select"
                renderValue={() => {
                    return selectedValue?.name ? `${selectedValue?.name}  ${selectedValue?.isFlatRate && '(one Rate)'}   ` : placeholder
                }}
                onClick={!disabled && onClick}
                open={false}
                disabled={disabled}
                sx={{
                    borderRadius: borderRadius ? borderRadius : '30px',
                    fontSize: fontSize ? fontSize : '14px',
                    '& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input ': {
                        paddingY: '4.5px',
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
                    <MenuItem key={index} value={option?.value} sx={{ fontSize: fontSize ? fontSize : '14px' }}>
                        {option?.name}
                    </MenuItem>
                ))}
            </Select>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                elevation={2}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <>
                    <Box p={2} sx={{ width: '550px', height: '400px' }}>
                        <Grid container>
                            <Grid pl={1.5} item xs={3}>
                                Account
                            </Grid>
                            <Grid item xs={3.5}>
                                Service
                            </Grid>
                            <Grid item xs={2}>
                                Transit
                            </Grid>
                            <Grid pl={1} item xs={2}>
                                Tags
                            </Grid>
                            <Grid item xs={1}>
                                Rate
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        {/* Temporarily disabled USPS rates with tooltip for user guidance (to be removed in a future update) */}
                        {Array.isArray(dropdownData) &&
                            dropdownData?.map((option, index) => (
                                <ListItemButton
                                    sx={{ p: 0, my: '2px' }}
                                    key={index}
                                    onClick={(event) => {
                                        handleListItemClick(option, event)
                                    }}
                                >
                                    <Grid container>
                                        <Grid item xs={3}>
                                            <Radio
                                                size="small"
                                                checked={option?.serviceCode === serviceTypeCode || option.serviceType == ''}
                                                // onChange={(event) => handleCheckboxChange(event, option)}
                                            />

                                            <Typography variant="body3" color={'lightPurple'}>
                                                {option?.accountNumber || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3.5} mt="6px">
                                            <Typography variant="body3Bold">
                                                {option?.serviceName || 'N/A'}
                                                {option?.isFlatRate && ' (one Rate)'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={2} mt="6px">
                                            {option?.tag === 'late' ? (
                                                <Chip
                                                    label={option.arrivalTimeValue}
                                                    sx={{
                                                        ...chipStyles,
                                                        bgcolor: '#FFE3E8',
                                                        color: 'lightPurple',
                                                        fontSize: '11px',
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="body3" color={'lightPurple'} ml={2}>
                                                    {option?.arrivalTimeValue || 'N/A'}
                                                </Typography>
                                            )}
                                        </Grid>

                                        <Grid item xs={2} mt="6px">
                                            {option.tag ? (
                                                <Chip
                                                    label={option?.tag || 'N/A'}
                                                    sx={{
                                                        ...chipStyles,
                                                        bgcolor: getChipBgColor(option?.tag),
                                                        color: getChipTextColor(option?.tag),
                                                        fontSize: '11px',
                                                    }}
                                                />
                                            ) : null}
                                        </Grid>
                                        <Grid item xs={1} mt="6px">
                                            <Typography variant="body3Bold">${option?.totalCharges || 'N/A'}</Typography>
                                        </Grid>
                                    </Grid>
                                </ListItemButton>
                            ))}
                    </Box>
                </>
            </Popover>
        </FormControl>
    )
}

const chipStyles = {
    borderRadius: '4px',
    height: '20px',
    width: '60px',
    fontWeight: '600',
    '& .MuiChip-label': {
        padding: '0px',
    },
}
