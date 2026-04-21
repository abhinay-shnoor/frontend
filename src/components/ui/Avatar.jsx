// Shows a real profile photo if avatarUrl is provided, falls back to an initials circle.
// Every place that renders a user's avatar should pass avatarUrl so photos show up
// as soon as the user has uploaded one.
export default function Avatar({ initials, color, size = 32, avatarUrl }) {
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
}