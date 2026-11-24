import { CATEGORIES } from "../model/types.js";

/**
 * Catálogo declarativo de preguntas para el proceso de onboarding.
 * Cada pregunta incluye su categoría, tipo, reglas de obligatoriedad y
 * reglas declarativas de transición o condiciones de activación.
 */
export const ONBOARDING_QUESTIONS = [
  // 1. Identidad
  {
    id: "identity_name",
    category: CATEGORIES.IDENTITY,
    question: "¿Cuál es el nombre del proyecto?",
    type: "text",
    required: true,
  },
  {
    id: "identity_purpose",
    category: CATEGORIES.IDENTITY,
    question: "¿Cuál es el propósito principal del proyecto?",
    description: "Una frase breve que resuma el objetivo fundamental.",
    type: "text",
    required: true,
  },
  {
    id: "identity_description",
    category: CATEGORIES.IDENTITY,
    question: "Descripción general del proyecto (opcional):",
    description: "Detalles adicionales sobre qué hace y cómo funciona.",
    type: "textarea",
    required: false,
  },

  // 2. Contexto
  {
    id: "context_problem",
    category: CATEGORIES.CONTEXT,
    question: "¿Qué problema específico resuelve este proyecto?",
    type: "textarea",
    required: true,
  },
  {
    id: "context_target_users",
    category: CATEGORIES.CONTEXT,
    question: "¿Quiénes son los usuarios u organizaciones objetivo?",
    type: "text",
    required: false,
  },

  // 3. Dominio
  {
    id: "domain_has_complex_rules",
    category: CATEGORIES.DOMAIN,
    question: "¿El proyecto maneja conceptos de dominio o reglas de negocio específicas?",
    type: "boolean",
    required: true,
    next: {
      true: "domain_concepts",
      false: "architecture_style",
    },
  },
  {
    id: "domain_concepts",
    category: CATEGORIES.DOMAIN,
    question: "¿Cuáles son los conceptos o entidades centrales del dominio?",
    description: "Ejemplo: Pedido, Factura, Usuario, Transacción.",
    type: "textarea",
    required: false,
    condition: { field: "domain_has_complex_rules", equals: true },
  },
  {
    id: "domain_business_rules",
    category: CATEGORIES.DOMAIN,
    question: "¿Cuáles son las reglas de negocio más importantes a respetar?",
    type: "textarea",
    required: false,
    condition: { field: "domain_has_complex_rules", equals: true },
  },

  // 4. Arquitectura
  {
    id: "architecture_style",
    category: CATEGORIES.ARCHITECTURE,
    question: "¿Cuál es el estilo o enfoque arquitectónico del proyecto?",
    type: "single_select",
    options: [
      { value: "modular-monolith", label: "Monolito modular" },
      { value: "cli-library", label: "Herramienta CLI o librería" },
      { value: "clean-architecture", label: "Clean Architecture / Hexagonal" },
      { value: "microservices", label: "Microservicios" },
      { value: "client-server", label: "Cliente - Servidor" },
      { value: "other", label: "Otro / Por definir" },
    ],
    required: false,
  },
  {
    id: "architecture_has_backend",
    category: CATEGORIES.ARCHITECTURE,
    question: "¿El alcance de este proyecto incluye (o incluirá) el desarrollo de un backend o API propia?",
    description: "Responde 'sí' si este repositorio contiene o desarrollará servicios de servidor o APIs. Responde 'no' si es exclusivamente frontend, una herramienta CLI local o una librería.",
    type: "boolean",
    required: true,
    next: {
      true: "architecture_backend_details",
      false: "architecture_has_frontend",
    },
  },
  {
    id: "architecture_backend_details",
    category: CATEGORIES.ARCHITECTURE,
    question: "¿Qué arquitectura, framework o componentes estructuran (o estructurarán) el backend?",
    description: "Indica la arquitectura actual o la planificada (ejemplo: REST API con Express/Fastify, GraphQL, NestJS, microservicios, etc.).",
    type: "text",
    required: false,
    condition: { field: "architecture_has_backend", equals: true },
  },
  {
    id: "architecture_has_frontend",
    category: CATEGORIES.ARCHITECTURE,
    question: "¿El alcance de este proyecto incluye (o incluirá) el desarrollo de una interfaz de usuario (web, móvil o escritorio)?",
    description: "Responde 'sí' si este repositorio contiene o desarrollará una interfaz gráfica para los usuarios.",
    type: "boolean",
    required: true,
    next: {
      true: "architecture_frontend_details",
      false: "technology_languages",
    },
  },
  {
    id: "architecture_frontend_details",
    category: CATEGORIES.ARCHITECTURE,
    question: "¿Qué tecnologías, frameworks o estructura tiene (o tendrá) el frontend?",
    description: "Indica la tecnología actual o la prevista (ejemplo: SPA con React, SSR con Next.js, app móvil con Flutter, etc.).",
    type: "text",
    required: false,
    condition: { field: "architecture_has_frontend", equals: true },
  },

  // 5. Tecnologías
  {
    id: "technology_languages",
    category: CATEGORIES.TECHNOLOGY,
    question: "¿Qué lenguajes de programación se utilizan principalmente?",
    type: "text",
    required: true,
  },
  {
    id: "technology_frameworks",
    category: CATEGORIES.TECHNOLOGY,
    question: "¿Cuáles son los frameworks y librerías principales?",
    type: "text",
    required: false,
  },
  {
    id: "technology_tools",
    category: CATEGORIES.TECHNOLOGY,
    question: "¿Qué herramientas de build, test o soporte se utilizan?",
    type: "text",
    required: false,
  },

  // 6. Convenciones
  {
    id: "conventions_standards",
    category: CATEGORIES.CONVENTIONS,
    question: "¿Cuáles son los estándares de código y prácticas del equipo?",
    description: "Ejemplo: Conventional Commits, ESLint, TDD, Clean Code.",
    type: "text",
    required: false,
  },

  // 7. Restricciones
  {
    id: "constraints_limitations",
    category: CATEGORIES.CONSTRAINTS,
    question: "¿Existen restricciones técnicas, regulatorias o de compatibilidad?",
    description: "Ejemplo: compatibilidad con Linux exclusivamente, versiones mínimas de runtime.",
    type: "textarea",
    required: false,
  },

  // 8. Estado actual
  {
    id: "state_phase",
    category: CATEGORIES.CURRENT_STATE,
    question: "¿En qué etapa se encuentra actualmente el proyecto?",
    type: "single_select",
    options: [
      { value: "greenfield", label: "Nuevo / Desde cero" },
      { value: "initial_development", label: "En desarrollo inicial" },
      { value: "mvp_functional", label: "MVP funcional" },
      { value: "production", label: "En producción" },
    ],
    required: true,
  },
  {
    id: "state_implemented_features",
    category: CATEGORIES.CURRENT_STATE,
    question: "¿Qué funcionalidades principales ya se encuentran implementadas?",
    type: "textarea",
    required: false,
  },

  // 9. Objetivos
  {
    id: "objectives_immediate",
    category: CATEGORIES.OBJECTIVES,
    question: "¿Cuál es el objetivo inmediato o próxima meta a alcanzar?",
    type: "text",
    required: true,
  },
  {
    id: "objectives_milestones",
    category: CATEGORIES.OBJECTIVES,
    question: "¿Cuáles son los siguientes hitos previstos?",
    type: "textarea",
    required: false,
  },
];
