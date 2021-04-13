



export default function ClickAndCollect() {
    return (
        <>
            <div className="section-picker">
                <div className="container w-container">
                    <div className="w-form">
                        <form id="email-form-2" name="email-form-2" data-name="Email Form 2" className="form-grid-retrait">
                            <img src="images/click-collect.svg" loading="lazy" height="50" id="w-node-_956301b6-5cd8-6ae0-4da8-bca62800047a-28000476" alt="" className="image-3" />
                            <label id="w-node-_956301b6-5cd8-6ae0-4da8-bca62800047b-28000476" className="checkbox-click-collect w-radio">
                                <input type="radio" data-name="Radio" id="retrait" name="Radio" value="Radio" required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                <span className="checkbox-label w-form-label">Retrait</span>
                            </label>
                            <label id="w-node-_956301b6-5cd8-6ae0-4da8-bca62800047f-28000476" className="checkbox-click-collect w-radio">
                                <input type="radio" data-name="Radio" id="retrait" name="Radio" value="Radio" required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                <span className="checkbox-label w-form-label">Livraison</span>
                            </label>
                            <select id="field-3" name="field-3" className="text-ville w-node-_956301b6-5cd8-6ae0-4da8-bca628000483-28000476 w-select">
                                <option value="">Ville</option>
                                <option value="First">First Choice</option>
                                <option value="Second">Second Choice</option>
                                <option value="Third">Third Choice</option>
                            </select>
                            <input type="text" className="text-date w-input" maxLength="256" name="field" data-name="Field" placeholder="Date. -- / -- / --" id="DatepickerBox2" required="" />
                            <select id="field-2" name="field-2" required="" className="select-heure w-select">
                                <option value="11-00">11h00</option>
                                <option value="11-15">11h15</option>
                                <option value="11-30">11h30</option>
                                <option value="11-45">11h45</option>
                                <option value="12-00">12h00</option>
                                <option value="12-15">12h15</option>
                                <option value="12-30">12h30</option>
                                <option value="12-45">12h45</option>
                                <option value="13-00">13h00</option>
                            </select>
                            <a id="w-node-d78b8f31-447d-ea0b-3e04-de52b0d1821c-28000476" href="#" className="adresse-button w-button">Vérifier mon retrait</a>
                        </form>
                        <div className="w-form-done">
                            <div>Thank you! Your submission has been received!</div>
                        </div>
                        <div className="w-form-fail">
                            <div>Oops! Something went wrong while submitting the form.</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="section-picker">
                <div className="container w-container">
                    <div className="form-block-2 w-form">
                        <form id="email-form-2" name="email-form-2" data-name="Email Form 2" className="form-grid-livraison">
                            <img src="images/click-collect.svg" loading="lazy" height="50" id="w-node-de72c864-5a9f-7b7b-fa59-e5995a958c81-5a958c7d" alt="" className="image-3" />
                            <label id="w-node-de72c864-5a9f-7b7b-fa59-e5995a958c82-5a958c7d" className="checkbox-click-collect w-radio">
                                <input type="radio" data-name="Radio" id="retrait" name="Radio" value="Radio" required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                <span className="checkbox-label w-form-label">Retrait</span>
                            </label>
                            <label id="w-node-de72c864-5a9f-7b7b-fa59-e5995a958c86-5a958c7d" className="checkbox-click-collect w-radio">
                                <input type="radio" data-name="Radio" id="retrait" name="Radio" value="Radio" required="" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-retrait w-radio-input"></div>
                                <span className="checkbox-label w-form-label">Livraison</span>
                            </label>
                            <input type="text" className="text-field-adresse w-node-de72c864-5a9f-7b7b-fa59-e5995a958c8a-5a958c7d w-input" maxLength="256" name="adresse-2" data-name="Adresse 2" placeholder="Saisir une adresse" id="adresse-2" required="" />
                            <a id="w-node-de72c864-5a9f-7b7b-fa59-e5995a958c8b-5a958c7d" href="#" className="adresse-button w-button">Vérifier mon adresse</a><input type="text" className="text-field-date-livraison w-node-de72c864-5a9f-7b7b-fa59-e5995a958c8d-5a958c7d w-input" maxLength="256" name="field" data-name="Field" placeholder="Date. -- / -- / --" id="DatepickerBox2" required="" /><select id="field-2" name="field-2" required="" className="select-heure-livraison w-node-de72c864-5a9f-7b7b-fa59-e5995a958c8e-5a958c7d w-select">
                                <option value="11-00">11h00</option>
                                <option value="11-15">11h15</option>
                                <option value="11-30">11h30</option>
                                <option value="11-45">11h45</option>
                                <option value="12-00">12h00</option>
                                <option value="12-15">12h15</option>
                                <option value="12-30">12h30</option>
                                <option value="12-45">12h45</option>
                                <option value="13-00">13h00</option>
                            </select>
                        </form>
                        <div className="w-form-done">
                            <div>Thank you! Your submission has been received!</div>
                        </div>
                        <div className="w-form-fail">
                            <div>Oops! Something went wrong while submitting the form.</div>
                        </div>
                    </div>
                </div>
            </div> */}
        </>
    );
}
