import { Stack } from '@mui/material'
import { Account } from '@toolpad/core'
import React from 'react'
import SearchToolbar from './SearchToolbar'

const CustomToolbarActions = (props: { NotificationNode: React.ReactNode}) => {
  return (
    <React.Fragment>
        <Stack direction="row" alignItems={"center"} spacing={2}>
            <SearchToolbar />
            {props.NotificationNode}
            <Account />
        </Stack>
    </React.Fragment>
  )
}


export default CustomToolbarActions
