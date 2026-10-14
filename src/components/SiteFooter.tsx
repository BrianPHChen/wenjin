import { SOCIAL } from '../data/social'
import { FacebookIcon, InstagramIcon } from './SocialIcons'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer-name">吳文進競選辦公室</p>
      <nav className="site-footer-links" aria-label="頁尾">
        <a href="./privacy">隱私權政策</a>
        <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
          <InstagramIcon />
        </a>
        <a href={SOCIAL.facebook} target="_blank" rel="noreferrer" aria-label="Facebook 粉專">
          <FacebookIcon />
        </a>
      </nav>
      <p className="site-footer-note">村里界：內政部國土測繪中心 村里界圖（TWD97，114 年版）</p>
    </footer>
  )
}
