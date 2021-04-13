
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

export default function Slider({ nsCode }) {


    if (nsCode === 'home-intro') {


        const homeIntro1 =
            <div className="slide-1 w-slide">
                <div className="container-flex">
                    <div className="hero-content">
                        <h1 className="hero-h1">Découvrez nos Menus <span className="text-span">à Emporter</span> !</h1>
                        <p className="hero-paragraph">Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500.</p>
                        <div className="button-wrapper">
                            <a href="/" className="button w-button">Commander !</a>
                        </div>
                    </div>
                    <div className="hero-image-wrap"><img src="/images/Phones.png" alt="Food Delivery" sizes="(max-width: 991px) 100vw, 50vw" srcSet="images/Phones-p-500.png 500w, images/Phones-p-800.png 800w, images/Phones.png 2103w" className="hero-image TODO_TMP_DISPLAY" /></div>
                </div>
            </div>;

        const homeIntro2 =
            <div className="slide-2 w-slide">
                <div className="container-flex">
                    <div className="hero-content">
                        <h2 className="hero-h1">Plats du jour<br />‍<span className="text-span">à Emporter</span> !</h2>
                        <p className="hero-paragraph">Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500.</p>
                        <div className="button-wrapper">
                            <a href="/" className="button w-button">Commander !</a>
                        </div>
                    </div>
                    <div className="hero-image-wrap"><img src="/images/pexels-pixabay-416510.jpg" alt="Food Delivery" sizes="(max-width: 991px) 100vw, 50vw" srcSet="images/pexels-pixabay-416510-p-1080.jpeg 1080w, images/pexels-pixabay-416510-p-1600.jpeg 1600w, images/pexels-pixabay-416510-p-2000.jpeg 2000w, images/pexels-pixabay-416510-p-2600.jpeg 2600w, images/pexels-pixabay-416510-p-3200.jpeg 3200w, images/pexels-pixabay-416510.jpg 4898w" className="hero-image" /></div>
                </div>
            </div>;

        const homeIntro3 =
            <div className="slide-3 w-slide">
                <div className="container-flex">
                    <div className="hero-content">
                        <h2 className="hero-h1 ">Coktail &amp; Drink<br />‍<span className="text-span">à Emporter</span> !</h2>
                        <p className="hero-paragraph">Lorem Ipsum is simply dummy text of the printing and typesetting
industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500.</p>
                        <div className="button-wrapper">
                            <a href="/" className="button w-button">Commander !</a>
                        </div>
                    </div>
                    <div className="hero-image-wrap"><img src="/images/kaleb-tapp-8q19GH2I88s-unsplash-2.jpg" alt="Food Delivery" sizes="(max-width: 991px) 100vw, 50vw" srcSet="images/kaleb-tapp-8q19GH2I88s-unsplash-2-p-500.jpeg 500w, images/kaleb-tapp-8q19GH2I88s-unsplash-2-p-800.jpeg 800w, images/kaleb-tapp-8q19GH2I88s-unsplash-2-p-1600.jpeg 1600w, images/kaleb-tapp-8q19GH2I88s-unsplash-2-p-2000.jpeg 2000w, images/kaleb-tapp-8q19GH2I88s-unsplash-2-p-2600.jpeg 2600w, images/kaleb-tapp-8q19GH2I88s-unsplash-2-p-3200.jpeg 3200w, images/kaleb-tapp-8q19GH2I88s-unsplash-2.jpg 8322w" className="hero-image TODO_TMP_DISPLAY" /></div>
                </div>
            </div>;

        const homeIntro = [homeIntro1, homeIntro2, homeIntro3];



        return (
            
            <Carousel 
                showStatus={false}
                showThumbs={false}
                renderArrowPrev={(onClickHandler, hasPrev, label) =>
                    hasPrev && (
                        <div className="left-arrow w-slider-arrow-left" onClick={onClickHandler} title={label}>
                            <div className="w-icon-slider-left" />
                        </div>
                    )
                }
                renderArrowNext={(onClickHandler, hasNext, label) =>
                    hasNext && (
                        <div className="right-arrow w-slider-arrow-right" onClick={onClickHandler} title={label}>
                            <div className="w-icon-slider-right" />
                        </div>
                    )
                }
            >
                {homeIntro.map((item, index) => (
                    <div key={index}>
                        {item}
                    </div>
                ))}
            </Carousel>
        );
    }
    else return null;
}
