import footerImg from '../../img/unicorn_icon.png';

function Footer() {
    const date = new Date().getFullYear();
    return (
        <div className="copyright">
            <p>Made with love by Myself <img  src={footerImg} className="footer-icon" alt='unicorn icon'/></p>
            <h4>{date}</h4>
        </div>
    );
};

export default Footer;