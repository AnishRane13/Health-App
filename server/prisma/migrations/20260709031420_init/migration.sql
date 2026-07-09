-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('REPORT_SUMMARY', 'TREND_ANALYSIS', 'WELLNESS_TIP');

-- CreateEnum
CREATE TYPE "MetricStatus" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "client_id" INTEGER,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "client_id" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "city" TEXT,
    "state" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "occupation" TEXT,
    "health_condition" TEXT,
    "beauty_goal" TEXT,
    "created_at" DATE NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "health_reports" (
    "report_id" TEXT NOT NULL,
    "client_id" INTEGER NOT NULL,
    "report_date" DATE NOT NULL,
    "hemoglobin" DOUBLE PRECISION,
    "vitamin_d" INTEGER,
    "cholesterol" INTEGER,
    "blood_sugar_fasting" INTEGER,
    "creatinine" DOUBLE PRECISION,
    "urine_protein" TEXT,
    "bmi" DOUBLE PRECISION,
    "doctor_notes" TEXT,

    CONSTRAINT "health_reports_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "health_insights" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "report_id" TEXT,
    "generated_by_id" INTEGER,
    "type" "InsightType" NOT NULL DEFAULT 'REPORT_SUMMARY',
    "title" TEXT,
    "content" TEXT NOT NULL,
    "metrics_context" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_metric_ranges" (
    "id" SERIAL NOT NULL,
    "metric_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT,
    "min_normal" DOUBLE PRECISION,
    "max_normal" DOUBLE PRECISION,
    "min_critical" DOUBLE PRECISION,
    "max_critical" DOUBLE PRECISION,
    "category" TEXT,

    CONSTRAINT "health_metric_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "csv_upload_logs" (
    "id" SERIAL NOT NULL,
    "uploaded_by_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "inserted_rows" INTEGER NOT NULL DEFAULT 0,
    "skipped_rows" INTEGER NOT NULL DEFAULT 0,
    "error_details" JSONB,
    "status" "UploadStatus" NOT NULL DEFAULT 'SUCCESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "csv_upload_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_client_id_key" ON "users"("client_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_full_name_idx" ON "clients"("full_name");

-- CreateIndex
CREATE INDEX "clients_city_idx" ON "clients"("city");

-- CreateIndex
CREATE INDEX "clients_state_idx" ON "clients"("state");

-- CreateIndex
CREATE INDEX "clients_health_condition_idx" ON "clients"("health_condition");

-- CreateIndex
CREATE INDEX "clients_gender_idx" ON "clients"("gender");

-- CreateIndex
CREATE INDEX "clients_beauty_goal_idx" ON "clients"("beauty_goal");

-- CreateIndex
CREATE INDEX "clients_created_at_idx" ON "clients"("created_at");

-- CreateIndex
CREATE INDEX "health_reports_client_id_idx" ON "health_reports"("client_id");

-- CreateIndex
CREATE INDEX "health_reports_report_date_idx" ON "health_reports"("report_date");

-- CreateIndex
CREATE INDEX "health_reports_client_id_report_date_idx" ON "health_reports"("client_id", "report_date" DESC);

-- CreateIndex
CREATE INDEX "health_insights_client_id_created_at_idx" ON "health_insights"("client_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "health_metric_ranges_metric_key_key" ON "health_metric_ranges"("metric_key");

-- CreateIndex
CREATE INDEX "csv_upload_logs_uploaded_by_id_idx" ON "csv_upload_logs"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "csv_upload_logs_created_at_idx" ON "csv_upload_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_reports" ADD CONSTRAINT "health_reports_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_insights" ADD CONSTRAINT "health_insights_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_insights" ADD CONSTRAINT "health_insights_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "health_reports"("report_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_insights" ADD CONSTRAINT "health_insights_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csv_upload_logs" ADD CONSTRAINT "csv_upload_logs_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
