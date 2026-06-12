export function PhoneStatusBar() {
  return (
    <div className="phone-status-bar" aria-hidden="true">
      <span>9:41</span>
      <div className="status-icons">
        <span className="cellular-bars">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="wifi-icon" />
        <span className="battery-icon" />
      </div>
    </div>
  );
}
