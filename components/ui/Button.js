import { useState, useEffect } from 'react';


export default function Button({ text = 'Bouton', loadingText = 'Loading...', isLoading = false, className = 'log-button w-button', disabled = false, style = {} }) {

    const [localLoader, setLocalLoader] = useState(false);

    // If isLoading is change and the loading is finish, settting localLoader to false
    useEffect(() => {
        if(!isLoading) {
            setLocalLoader(false);
        }
    }, [isLoading]);


    const onClickHandler = async () => {
        setLocalLoader(true);
    };

    return <button type="submit" className={className} disabled={isLoading || disabled ? 'disabled' : ''} onClick={onClickHandler} style={style}>{localLoader && isLoading ? loadingText : text}</button>;
}
