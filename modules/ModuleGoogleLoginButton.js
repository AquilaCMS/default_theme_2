import { useEffect, useState }          from 'react';
import { GoogleLogin, useGoogleLogout } from 'react-google-login';
import { useRouter }                    from 'next/router';
import useTranslation                   from 'next-translate/useTranslation';
import axios                            from '@aquilacms/aquila-connector/lib/AxiosInstance';

// GET API key for Google Maps 
async function getClientId() {
    try {
        const response = await axios.get('auth/google/config');
        return response.data.clientId;
    } catch(err) {
        console.error('authGoogle.getClientId');
        throw new Error(err?.response?.data?.message);
    }
}

async function authGoogle(options) {
    try {
        const response = await axios.get('auth/google', options);
        return response;
    } catch(err) {
        console.error('authGoogle.authGoogle');
        throw new Error(err?.response?.data?.message);
    }
}

export default function ModuleGoogleLoginButton() {
    const [clientId, setClientId] = useState();
    const router                  = useRouter();
    const { t }                   = useTranslation();
    const redirect                = router?.query?.redirect || '/account/informations';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const key = await getClientId();
                setClientId(key);
            } catch (err) {
                console.error(err.message || t('common:message.unknownError'));
            }
        };
        fetchData();
    }, []);

    const handleSuccess = async (response) => {
        const tokenBlob = new Blob([JSON.stringify({ access_token: response.getAuthResponse().id_token }, null, 2)], { type: 'application/json' });
        const options   = {
            method: 'POST',
            body  : tokenBlob,
            mode  : 'cors',
            cache : 'default',
        };
        console.log(options);
        /*const r = await authGoogle(options);
        if (r.status === 401) {
            console.error(r.data);
        } else {
            router.push(redirect);
        }*/
    };

    const handleFailure = () => {
        console.error();
    };

    if (!clientId) {
        return null;
    }

    return (
        <GoogleLogin
            clientId={clientId}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
        />
    );
}