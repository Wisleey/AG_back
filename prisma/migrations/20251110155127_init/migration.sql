-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ADMIN', 'GESTOR', 'MEMBRO');

-- CreateEnum
CREATE TYPE "StatusIntencao" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "StatusMembro" AS ENUM ('ATIVO', 'INATIVO', 'PENDENTE', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "StatusIndicacao" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'FECHADA', 'PERDIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL DEFAULT 'MEMBRO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intencao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "cargo" TEXT,
    "area_atuacao" TEXT,
    "mensagem" TEXT,
    "status" "StatusIntencao" NOT NULL DEFAULT 'PENDENTE',
    "aprovado_por" TEXT,
    "data_intencao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_avaliacao" TIMESTAMP(3),
    "motivo_rejeicao" TEXT,
    "token_convite" TEXT,

    CONSTRAINT "intencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membro" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "empresa" TEXT,
    "cargo" TEXT,
    "area_atuacao" TEXT,
    "foto_url" TEXT,
    "linkedin" TEXT,
    "status" "StatusMembro" NOT NULL DEFAULT 'ATIVO',
    "data_entrada" DATE,
    "bio" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicacao" (
    "id" TEXT NOT NULL,
    "membro_indicador_id" TEXT NOT NULL,
    "membro_indicado_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "contato_cliente" TEXT,
    "valor_estimado" DECIMAL(15,2),
    "status" "StatusIndicacao" NOT NULL DEFAULT 'ABERTA',
    "data_indicacao" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_fechamento" DATE,
    "valor_fechado" DECIMAL(15,2),
    "percentual_comissao" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indicacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "intencao_email_key" ON "intencao"("email");

-- CreateIndex
CREATE UNIQUE INDEX "intencao_token_convite_key" ON "intencao"("token_convite");

-- CreateIndex
CREATE UNIQUE INDEX "membro_usuario_id_key" ON "membro"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "membro_email_key" ON "membro"("email");

-- AddForeignKey
ALTER TABLE "membro" ADD CONSTRAINT "membro_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacao" ADD CONSTRAINT "indicacao_membro_indicador_id_fkey" FOREIGN KEY ("membro_indicador_id") REFERENCES "membro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacao" ADD CONSTRAINT "indicacao_membro_indicado_id_fkey" FOREIGN KEY ("membro_indicado_id") REFERENCES "membro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
