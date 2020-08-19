export const getUserMenu = (role: "USER_ROLE" | "ADMIN_ROLE" = "USER_ROLE") => {
  const baseMenu: Object[] = [
    {
      title: "Dashboard",
      icon: "mdi mdi-gauge",
      link: "",
      submenu: [{ title: "Grafica", link: "progress" }],
    },
    {
      title: "Mantenimientos",
      icon: "mdi mdi-folder-lock-open",
      link: "users",
      submenu: [
        { title: "Médicos", link: "doctors" },
        { title: "Hospitales", link: "hospitals" },
      ],
    },
  ];

  if (role == "ADMIN_ROLE")
    baseMenu[1]["submenu"].unshift({ title: "Usuarios", link: "users" });

  return baseMenu;
};
