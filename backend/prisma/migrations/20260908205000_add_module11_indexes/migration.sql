-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mobiles_status_brandId_idx" ON "mobiles"("status", "brandId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mobiles_status_featured_idx" ON "mobiles"("status", "featured");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "parts_status_categoryId_idx" ON "parts"("status", "categoryId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "parts_quantity_idx" ON "parts"("quantity");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "enquiries_customerId_status_idx" ON "enquiries"("customerId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "enquiries_status_createdAt_idx" ON "enquiries"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "service_requests_customerId_status_idx" ON "service_requests"("customerId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "service_requests_status_createdAt_idx" ON "service_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_status_idx" ON "notifications"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");
