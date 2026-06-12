import volumeMateLogo from '../assets/VolumeMate_Icon.svg';

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={volumeMateLogo}
      alt="VolumeMate"
    />
  );
}
