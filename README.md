
# Task managenemt system


## Overview
This is a Tasks Management System built with NestJS, TypeORM, and PostgreSQL. It provides a backend API for managing tasks, users, and authentication using JWT. The project includes database migrations, logging with Winston, and API documentation with Swagger.

### Prerequisites
Before running the project, ensure you have the following installed:

Node.js (v18 or higher)
npm (v8 or higher)
PostgreSQL (v13 or higher)
Git (optional, for cloning the repository)
Docker (run container)

### Schema database

[image](https://media-hosting.imagekit.io/7d23c3e8274148eb/screenshot_1743869187244.png?Expires=1838477188&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=ahazxKwjqevfgscjB2OBXwZ8VhAVgl2~~BtIHeD7-bbdmSAnZmbF-qivBdx8SbVBh63XazUZajvbhRv8SzS8cCbO8X4FB-jRF5TiL3qevz7IFilF-zLsbmiqqt9WPMXwInjqKBJnYgk-RgW5Gb2YPB6Lh0IDLSax~e~OaUWAOehxvrU5p0sVCnjO5pV-tf69dtZo~29dXlS9v8YhEtovY6GNuaDyumUmp5RzKYSKTgGgfV7sqsoTnHxtYazldUXlSovCHV3~VkBOhoVPbzkMUPh04RxYp8SaZ5TGDXp5gvbfb4ky1Gva4WJlpJERPhjMruqqUNmLeFuDByQE4nF8hg__)


## Installation

Clone the repository (if applicable)

```bash
    git clone https://github.com/nguyenhuuphu1999/tasks-management-system.git
    cd tasks-management-system
```
### Start project
Make the script executable:
```bash
    chmod +x run.sh
```

Execute the script:
```bash
    bash ./run.sh
```
Import user admin system

```bash
    INSERT INTO task_management.public."user" (id, username, email, "password", "role", "createdAt", "updatedAt", deleted, "refreshToken", "accessToken") VALUES('407b678c-8877-408e-9b07-d3360415efc2'::uuid, 'admin', 'admin@gmail.com', '$2b$10$kyShNiSWC5VCxWk41nKLvOafDIiU8jd05Qc9BBqgDDWP7C.l7KTim', 'ADMIN'::public."user_role_enum", '2025-04-05 15:21:57.200', '2025-04-05 15:21:57.214', false, '', '');
```

### API Testing with Postman
You can test the API using Postman. The Postman collection is available in the <b> postman/Task management.postman_collection.json </b> file


## Authors

- After run script insert user role <b> ADMIN </b> login then you can login with with
```bash
    EMAIL: admin@gmail.com
    PASSWORD: 123456
```

- User nomal can register click register new user.

- Database info default
```bash
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USERNAME=postgres
    DATABASE_PASSWORD=password
    DATABASE_NAME=task_management
```
## Screenshots

![screenshot_1743871175208.png](<https://media-hosting.imagekit.io/974b28cc94a3465d/screenshot_1743871175208.png?Expires=1838479176&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=rpi1Tbxcs4M5nuz-jr2WjHKxDwZUVDM84-mTiFAVrfyN~z42krKyzcFM3Xp~2dJ-Kn3xwLBW2Pdm7pa4B8m6VbWzRJsBdtyjid5b8AoG7d1~CGTm4KLG4RsFPNYt1PG6EEaBU215Nk5d0zpZef7x3IuwA-aaiZoCkxjwF35MMNL584JUvmROFBZWSRNWLRLNBud27I4j1l--e99eedw3Ga2ubKG5On2M7CiZLEdpQYd3t9ZIHI-0LsePxSq5YdFV0AtR3I6pT4gMGnaJGj10fg2NKJJEEdYkQgu-NXsEuibxORqKO-obj5osOB8k5-9U65WKOS2PQwrGJPJ7x7rT-g__>)

