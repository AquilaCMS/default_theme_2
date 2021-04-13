import { useState }  from 'react';
import { useRouter } from 'next/router';
import Button        from '@components/ui/Button';
import { auth }      from '@lib/aquila-connector/login';
import { setUser }   from '@lib/aquila-connector/user';

export default function RegisterBlock() {
    const [messageRegister, setMessageRegister] = useState();
    const [isLoading, setIsLoading]             = useState(false);
    const router                                = useRouter();
    const redirect                              = router?.query?.redirect || '/account/informations';

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const user = {
            firstname: e.currentTarget.firstname.value,
            lastname : e.currentTarget.lastname.value,
            email    : e.currentTarget.email.value,
            password : e.currentTarget.password.value,
        };
        try {
            await setUser(user);
            const res       = await auth(user.email, user.password);
            document.cookie = 'jwt=' + res.data;
            router.push(redirect);
        } catch (err) {
            setMessageRegister({ type: 'error', message: err.message });
            setIsLoading(false);
        }
    };

    return (
        <form className="col-log-int w-col w-col-5" onSubmit={handleRegisterSubmit}>
            <div className="log-label">Je suis un nouveau client</div>
            <div className="w-form">
                <div>
                    <div><input type="text" className="w-input" maxLength={256} name="firstname" placeholder="Prénom" required /></div>
                    <div><input type="text" className="w-input" maxLength={256} name="lastname" placeholder="Nom" required /></div>
                    <div><input type="email" className="w-input" maxLength={256} name="email" placeholder="Email" required autoComplete="username" /></div>
                    <div><input type="password" className="w-input" maxLength={256} name="password" placeholder="Mot de passe" required autoComplete="current-password" /></div>
                </div>
            </div>
            {
                messageRegister && (
                    <div className={`w-commerce-commerce${messageRegister.type}`}>
                        <div>
                            {messageRegister.message}
                        </div>
                    </div>
                )
            }
            <Button text="JE M&apos;ENREGISTRE" loadingText='INSCRIPTION...' isLoading={isLoading} className="log-button w-button" />
        </form>
    );
}