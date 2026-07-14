/*
# DSSMA Digital — Seed initial data

Populates setores, temas, and a few sample dialogos/participantes
so the app has meaningful data on first load.
*/

-- Setores
INSERT INTO setores (nome, responsavel) VALUES
  ('Produção', 'Carlos Silva'),
  ('Logística', 'Ana Santos'),
  ('Manutenção', 'João Oliveira'),
  ('Administrativo', 'Maria Costa'),
  ('Qualidade', 'Pedro Alves')
ON CONFLICT DO NOTHING;

-- Temas
INSERT INTO temas (titulo, categoria, descricao) VALUES
  ('Uso correto de EPIs', 'seguranca', 'Capacetes, luantas, óculos de proteção e calçados de segurança — importância e uso correto.'),
  ('Prevenção de quedas', 'seguranca', 'Trabalho em altura, escadas, plataformas e proteção contra quedas.'),
  ('Ergonomia no trabalho', 'saude', 'Postura correta, levantamento de peso e prevenção de LER/DORT.'),
  ('Higiene pessoal', 'saude', 'Importância da higiene pessoal para a saúde no ambiente de trabalho.'),
  ('Coleta seletiva de resíduos', 'meio_ambiente', 'Separação correta de resíduos sólidos, recicláveis e orgânicos.'),
  ('Economia de energia', 'meio_ambiente', 'Boas práticas para redução do consumo de energia elétrica.'),
  ('Riscos elétricos', 'seguranca', 'Identificação e prevenção de riscos elétricos no ambiente de trabalho.'),
  ('Saúde mental', 'saude', 'Identificação de sinais de estresse e burnout, e estratégias de autocuidado.'),
  ('Descarte de produtos químicos', 'meio_ambiente', 'Procedimentos corretos para descarte de resíduos químicos industriais.'),
  ('Primeiros socorros', 'saude', 'Procedimentos básicos de primeiros socorros em caso de acidentes.')
ON CONFLICT DO NOTHING;

-- Sample dialogos
INSERT INTO dialogos (titulo, tema, categoria, data_realizacao, setor, responsavel, duracao_minutos, num_participantes, observacoes, status) VALUES
  ('DDS - Uso de EPIs na Produção', 'Uso correto de EPIs', 'seguranca', '2025-07-07', 'Produção', 'Carlos Silva', 15, 12, 'Boa participação da equipe. Todos atentos às orientações.', 'realizado'),
  ('DDS - Ergonomia na Logística', 'Ergonomia no trabalho', 'saude', '2025-07-08', 'Logística', 'Ana Santos', 20, 8, 'Equipe demonstrou interesse no tema. Solicitaram treinamento prático.', 'realizado'),
  ('DDS - Coleta seletiva', 'Coleta seletiva de resíduos', 'meio_ambiente', '2025-07-09', 'Qualidade', 'Pedro Alves', 15, 6, 'Implementação de lixeiras com cores padronizadas.', 'realizado'),
  ('DDS - Prevenção de quedas', 'Prevenção de quedas', 'seguranca', '2025-07-10', 'Manutenção', 'João Oliveira', 25, 10, 'Demonstração prática de cinto de segurança.', 'realizado'),
  ('DDS - Saúde mental', 'Saúde mental', 'saude', '2025-07-11', 'Administrativo', 'Maria Costa', 30, 15, 'Abordagem sobre estresse no trabalho. Equipe participativa.', 'realizado'),
  ('DDS - Riscos elétricos', 'Riscos elétricos', 'seguranca', '2025-07-14', 'Manutenção', 'João Oliveira', 20, 7, NULL, 'agendado')
ON CONFLICT DO NOTHING;

-- Sample participantes
INSERT INTO participantes (dialogo_id, nome, matricula, setor, assinatura)
SELECT d.id, 'Roberto Fernandes', '00123', 'Produção', true
FROM dialogos d WHERE d.titulo = 'DDS - Uso de EPIs na Produção'
ON CONFLICT DO NOTHING;

INSERT INTO participantes (dialogo_id, nome, matricula, setor, assinatura)
SELECT d.id, 'Juliana Souza', '00124', 'Produção', true
FROM dialogos d WHERE d.titulo = 'DDS - Uso de EPIs na Produção'
ON CONFLICT DO NOTHING;

INSERT INTO participantes (dialogo_id, nome, matricula, setor, assinatura)
SELECT d.id, 'Marcos Lima', '00125', 'Produção', true
FROM dialogos d WHERE d.titulo = 'DDS - Uso de EPIs na Produção'
ON CONFLICT DO NOTHING;

INSERT INTO participantes (dialogo_id, nome, matricula, setor, assinatura)
SELECT d.id, 'Fernanda Rocha', '00201', 'Logística', true
FROM dialogos d WHERE d.titulo = 'DDS - Ergonomia na Logística'
ON CONFLICT DO NOTHING;

INSERT INTO participantes (dialogo_id, nome, matricula, setor, assinatura)
SELECT d.id, 'Ricardo Gomes', '00202', 'Logística', true
FROM dialogos d WHERE d.titulo = 'DDS - Ergonomia na Logística'
ON CONFLICT DO NOTHING;
