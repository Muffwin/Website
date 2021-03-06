import React from 'react';
import {Helmet} from "react-helmet";
import { FormattedMessage } from 'react-intl';

import NavBarLanding from '../../Landing/Components/Navbar';

import './css/NotFound.scss';

const Error = () => {
    return (
        <div className={"notFoundWrapper"}>

          <Helmet>
            <meta name="description" content="Cette page n'existe pas. Rendez-vous sur https://www.kwili.fr pour plus de détails !" />
            <meta name="robots" content="noindex, follow" />
          </Helmet>

            <NavBarLanding/>

            <div className={"blueCurveWrapper"} >
                <svg viewBox="0 0 500 150" className={"blueCurve"} preserveAspectRatio="none">
                    <path d="M-2.54,109.03 C214.73,168.25 308.96,67.59 507.62,138.64 L500.00,0.00 L0.00,0.00 Z"></path>
                </svg>
            </div>

            <div className={"notFound"}>
                <h1>Oops!</h1>
                <h2>404 - Page not found</h2>
                <p>
                    <FormattedMessage
                        id="NotFound.Desc"
                        defaultMessage="La page que vous recherchez n'est pas disponible, elle a peut-être été modifiée ou retirée."
                    />
                </p>
                <a href="/">
                <FormattedMessage
                    id="NotFound.Home"
                    defaultMessage="Accueil"
                />
                </a>
            </div>

        </div>
    )
};

export default Error;
