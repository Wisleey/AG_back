-- CreateTable
CREATE TABLE "obrigado" (
    "id" TEXT NOT NULL,
    "indicacao_id" TEXT,
    "membro_que_agradece" TEXT NOT NULL,
    "membro_agradecido" TEXT NOT NULL,
    "mensagem" TEXT,
    "data_obrigado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "obrigado_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "obrigado" ADD CONSTRAINT "obrigado_indicacao_id_fkey" FOREIGN KEY ("indicacao_id") REFERENCES "indicacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obrigado" ADD CONSTRAINT "obrigado_membro_que_agradece_fkey" FOREIGN KEY ("membro_que_agradece") REFERENCES "membro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obrigado" ADD CONSTRAINT "obrigado_membro_agradecido_fkey" FOREIGN KEY ("membro_agradecido") REFERENCES "membro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
