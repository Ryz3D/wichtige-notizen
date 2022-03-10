import { useNavigate } from 'react-router-dom';

export default function routerNavigate(Component) {
    return props => {
        const navigate = useNavigate();
        return (
            <Component
                navigate={navigate}
                {...props}
            />
        );
    };
};
