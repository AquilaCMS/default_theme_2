import newsletterProvider from '@lib/aquila-connector/newsletter';

export default function Newsletter() {

    const handleNLSubmit = async (e) => {
        e.preventDefault();
        const email = e.currentTarget.email.value;
        await newsletterProvider.setNewsletter(email);
    };

    return (

        <div className="container-newsletter">
            <h4>
                <span className="text-span-9">
                    S&apos;inscrire à la Newsletter
                </span>
            </h4>
            <div className="w-form">
                <form className="form-3" onSubmit={handleNLSubmit}>
                    <input type="email" className="text-field-2 w-input" maxLength={256} name="email" placeholder="Email" required />
                    <input type="submit" defaultValue="Newsletter" className="submit-button-newsletter w-button" />
                </form>
            </div>
        </div>
    );
}
