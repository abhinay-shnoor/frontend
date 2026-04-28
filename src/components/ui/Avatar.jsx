// Shows a real profile photo if avatarUrl is provided, falls back to an initials circle.
// Every place that renders a user's avatar should pass avatarUrl so photos show up
// as soon as the user has uploaded one.
export default function Avatar({ initials, color, size = 32, avatarUrl, statusColor }) {
  const renderAvatar = () => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={initials || "User"}
          style={{
            width: size,
            height: size,
            minWidth: size,
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
            display: "block",
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: "50%",
          background: color || "#0D9488",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.35,
          fontWeight: 600,
          color: "white",
          flexShrink: 0,
          letterSpacing: "0.5px",
          userSelect: "none",
        }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {renderAvatar()}
      {statusColor && (
        <div
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: Math.max(8, size * 0.25),
            height: Math.max(8, size * 0.25),
            borderRadius: "50%",
            background: statusColor,
            border: `${Math.max(1.5, size * 0.05)}px solid var(--ws-bg, #fff)`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}