import React from 'react';
import './DesktopSplitLayout.css';

function DesktopSplitLayout({
  leftContent,
  rightContent,
  rightClassName = '',
  singlePanel = false,
  showVideo = true,
}) {
  if (singlePanel) {
    return (
      <div className="desktop-split desktop-split--single">
        <div className="desktop-split__left">{leftContent}</div>
      </div>
    );
  }

  return (
    <div className="desktop-split">
      <div className="desktop-split__left">{leftContent}</div>

<div
  className={`desktop-split__right ${rightClassName} ${
    !showVideo ? 'desktop-split__right--no-video' : ''
  }`.trim()}
>
  {showVideo && (
    <video className="bg-video" autoPlay muted loop playsInline>
      <source src="/background.mp4" type="video/mp4" />
    </video>
  )}

  <div className="desktop-split__right-scroll">
    {rightContent}
  </div>
</div>

    </div>
  );
}

export default DesktopSplitLayout;
