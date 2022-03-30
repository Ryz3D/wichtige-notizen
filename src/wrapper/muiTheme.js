import { useTheme } from '@mui/material';
import React from 'react';

export default function muiTheme(Component) {
    return React.forwardRef((props, ref) => {
        const theme = useTheme();
        return (
            <Component
                {...props}
                theme={theme}
                ref={ref}
            />
        );
    });
};
