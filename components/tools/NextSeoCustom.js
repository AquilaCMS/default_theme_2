import { NextSeo } from 'next-seo';

export default function NextSeoCustom({ title, description, canonical, image, lang }) {
    return (
        <NextSeo
            title={title}
            description={description}
            canonical={canonical}
            openGraph={{
                url        : canonical,
                title      : title,
                description: description,
                locale     : lang,
                images     : [
                    {
                        url: image,
                        alt: title,
                    }
                ],
            }}
        />
    );
}