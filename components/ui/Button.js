import { useState, useEffect } from 'react';


export default function Button({ text = 'Bouton', loadingText = 'Chargement...', isLoading = false, className='log-button w-button' }) {

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

    return <button type="submit" className={className} disabled={isLoading ? 'disabled' : ''} onClick={onClickHandler}>{localLoader && isLoading ? loadingText : text}</button>;
}
