-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Posts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "slug" TEXT,
    "description" TEXT,
    "image" TEXT,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Posts2" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "slug" TEXT,
    "description" TEXT,
    "content" TEXT,
    "metadata" TEXT,
    "specs" JSONB,
    "image" TEXT,
    "postId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Posts2_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SliderPhotos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "image" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "posts2Id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SliderPhotos_posts2Id_fkey" FOREIGN KEY ("posts2Id") REFERENCES "Posts2" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Color" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "image" TEXT,
    "category" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ColorPosts2" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "colorId" INTEGER NOT NULL,
    "posts2Id" INTEGER NOT NULL,
    CONSTRAINT "ColorPosts2_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ColorPosts2_posts2Id_fkey" FOREIGN KEY ("posts2Id") REFERENCES "Posts2" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pdf" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "posts2Id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pdf_posts2Id_fkey" FOREIGN KEY ("posts2Id") REFERENCES "Posts2" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Advantage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdvantagePosts2" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "advantageId" INTEGER NOT NULL,
    "posts2Id" INTEGER NOT NULL,
    CONSTRAINT "AdvantagePosts2_advantageId_fkey" FOREIGN KEY ("advantageId") REFERENCES "Advantage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdvantagePosts2_posts2Id_fkey" FOREIGN KEY ("posts2Id") REFERENCES "Posts2" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "content" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Posts_slug_key" ON "Posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Posts2_slug_key" ON "Posts2"("slug");

-- CreateIndex
CREATE INDEX "SliderPhotos_posts2Id_idx" ON "SliderPhotos"("posts2Id");

-- CreateIndex
CREATE INDEX "ColorPosts2_colorId_idx" ON "ColorPosts2"("colorId");

-- CreateIndex
CREATE INDEX "ColorPosts2_posts2Id_idx" ON "ColorPosts2"("posts2Id");

-- CreateIndex
CREATE UNIQUE INDEX "ColorPosts2_colorId_posts2Id_key" ON "ColorPosts2"("colorId", "posts2Id");

-- CreateIndex
CREATE INDEX "Pdf_posts2Id_idx" ON "Pdf"("posts2Id");

-- CreateIndex
CREATE INDEX "AdvantagePosts2_advantageId_idx" ON "AdvantagePosts2"("advantageId");

-- CreateIndex
CREATE INDEX "AdvantagePosts2_posts2Id_idx" ON "AdvantagePosts2"("posts2Id");

-- CreateIndex
CREATE UNIQUE INDEX "AdvantagePosts2_advantageId_posts2Id_key" ON "AdvantagePosts2"("advantageId", "posts2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");
