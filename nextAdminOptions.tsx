        import type { NextAdminOptions } from "@premieroctet/next-admin";


        const options: NextAdminOptions = {
          title: "DOORHAN ADMIN",
          pages: {
            "/custom": {
              title: "Дополнительная страница",
              icon: "AdjustmentsHorizontalIcon",
            },
          },
          externalLinks: [
            {
              label: "App Router",
              url: "/",
            },
          ],
          sidebar: {
            groups: [
              {
                title: "Пользователи",
                className: "bg-green-600 p-2 rounded-md",
                models: ["User"],
              },
              {
                title: "Цвета",
                className: "bg-blue-600 p-2 rounded-md",
                models: ["Color"],
              },
            ],
          },
          model: {
            User: {
              toString: (user) => `${user.name} (${user.email})`,
              title: "Пользователи",
              icon: "UserIcon",
              list: {
                display: ["id", "name", "email"],
                search: ["name", "email"],
                filters: [
                  {
                    name: "Search by name",
                    active: false,
                    value: {
                      name: {
                        equals: "",
                      },
                    },
                  },
                ],
              },
              edit: {
                display: ["id", "name", "email"],
              },
            },

            Posts: {
              toString: (post) => `${post.name}`,
              title: "Категория",
              icon: "DocumentTextIcon",
              list: {
                display: ["id", "name", "slug", "description", "image", "category", "posts2"],
                search: ["name", "slug", "description"],
                fields: {
                  posts2: {
                    formatter: (item) => {
                      const postsArray = (item as unknown as { id: string; name?: string }[]); // Приведение типа
                  
                      if (!Array.isArray(postsArray) || postsArray.length === 0) {
                        return <span>Нет дочерних записей</span>;
                      }
                  
                      return (
                        <ul>
                          {postsArray.map((child) => (
                            <li key={child.id}>{child.name || "Без имени"}</li>
                          ))}
                        </ul>
                      );
                    },
                  },                            
                },
              },
              edit: {
                display: ["id", "name", "slug", "description", "category", "image"],
                fields: {
                  image: {
                    format: "file",
                    handler: {
                      upload: async (buffer, infos) => {
                        const formData = new FormData();
                        // Проверяем, что infos не равно null, и используем infos.name или запасное имя
                        const fileName = infos?.name || 'default_filename';
                        formData.append("file", new Blob([buffer]), fileName);
              
                        const res = await fetch("http://127.0.0.1:3000/api/upload", {
                          method: "POST",
                          body: formData,
                        });
                        if (!res.ok) {
                          throw new Error("Ошибка загрузки файла");
                        }
                        const data = await res.json();
                        return data.url;
                      },  
                    },
                  },
                },
              }
              
            },
                // Новая конфигурация для модели "ColorOption"
    Color: {
      toString: (color) => `${color.name}`,
      title: "Цвета",
      icon: "EyeDropperIcon", // можно указать любой подходящий значок
      list: {
        display: ["id", "category", "name", "image"],
        search: ["category", "name"],
      },
      edit: {
        display: ["id", "category", "name", "image"],
        fields: {
          image: {
            format: "file",
            handler: {
              upload: async (buffer, infos) => {
                const formData = new FormData();
                const fileName = infos?.name || "default_filename";
                formData.append("file", new Blob([buffer]), fileName);
                const res = await fetch("http://127.0.0.1:3000/api/upload", {
                  method: "POST",
                  body: formData,
                });
                if (!res.ok) {
                  throw new Error("Ошибка загрузки файла");
                }
                const data = await res.json();
                return data.url;
              },
            },
          },
        },
      },
    },
            Posts2: {
              toString: (post2) => `${post2.name}`,
              title: "Товары",
              icon: "PencilIcon",
              list: {
                display: ["id", "name", "slug", "description", "post", "image"],
                search: ["name", "slug", "description"],
                fields: {
                  post: {
                    formatter: (post) => {
                      if (!post) {
                        return <span>Нет родительского поста</span>;
                      }
                      return <strong>{post.name}</strong>;
                    },
                  },
                },
              },
              edit: {
                display: ["id", "name", "content", "slug", "specs", "description", "post", "image", "colors"],
                fields: {
                  colors: {
                    relationOptionFormatter: (color) => `${color.name} (${color.category})`,
                    display: "list",
                    orderField: "order",
                    relationshipSearchField: "color",
                  },
                  description: {
                    format: "richtext-html",
                  },
                  specs: {
                    format: "json",
                  },
                  image: {
                    format: "file",
                    handler: {
                      upload: async (buffer, infos) => {
                        const formData = new FormData();
                        // Проверяем, что infos не равно null, и используем infos.name или запасное имя
                        const fileName = infos?.name || 'default_filename';
                        formData.append("file", new Blob([buffer]), fileName);
              
                        const res = await fetch("http://127.0.0.1:3000/api/upload", {
                          method: "POST",
                          body: formData,
                        });
                        if (!res.ok) {
                          throw new Error("Ошибка загрузки файла");
                        }
                        const data = await res.json();
                        return data.url;
                      },  
                    },
                  },
                },
              },
            },
          },
        };

        export default options;