import React from 'react';
import * as mui from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function LinkButton(props) {
    const navigate = useNavigate();

    return (
        <mui.Button onClick={_ => navigate(props.url)} {...props}>
            {props.children}
        </mui.Button>
    );
}
