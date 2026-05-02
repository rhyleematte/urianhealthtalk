export const KnowledgeBase = {
  categories: {
    GENERAL: {
      description: "General facts, definitions, and prevalence of mental disorders globally.",
      sources: ["Mental_disorders_WHO.pdf", "Health_topics_Mental_Health_WHO_data.pdf"],
      key_points: [
        "1 in 8 people globally live with a mental disorder.",
        "Anxiety and depression are the most common.",
        "Mental health conditions is a broad term covering disorders, psychosocial disabilities, and states of significant distress.",
        "Effective prevention and treatment exist but access is limited."
      ]
    },
    STRESS_TRAUMA: {
      description: "Assessment and management of conditions specifically related to stress and humanitarian emergencies.",
      sources: ["mhGAP_module_Assessment_Management_of_Conditions_Specifically_Related_to_Stress_WHO.pdf", "mhGAP_Humanitarian_Intervention_Guide_(mhGAP-HIG)_WHO.pdf"],
      key_points: [
        "Focus on acute stress, PTSD, and bereavement.",
        "Principles: Psychological first aid, addressing social needs, and non-specialized clinical management.",
        "Avoid medicalizing normal distress in humanitarian settings.",
        "Suggest stress reduction and strengthening social support."
      ]
    },
    WORKPLACE: {
      description: "Guidelines for mental health in the workplace, stress management, and organizational support.",
      sources: ["Guidelines_on_mental_health_at_work.pdf"],
      key_points: [
        "Focus on work-life balance, reasonable accommodations, and reducing workplace stressors.",
        "Managers should be trained to recognize distress and support employees.",
        "Promote a culture of openness and reduce stigma."
      ]
    },
    DEMENTIA: {
      description: "Assessment and psychosocial management of dementia.",
      sources: ["dementia-module_WHO.pdf"],
      key_points: [
        "Dementia is progressive and not a normal part of aging.",
        "Focus on respect, dignity, and communication skills.",
        "Psychosocial interventions are first-line; avoid routine pharmacological intervention.",
        "Critical to assess and support the carer's well-being."
      ]
    },
    INTERVENTION: {
      description: "The core mhGAP playbook for non-specialized health settings.",
      sources: ["mhGAP_Intervention_Guide_Version_2.0_WHO.pdf", "WHO_mhGAP_Guideline_Update_WHO.pdf"],
      key_points: [
        "General principles: Provide essential care, listen actively, and respect the person.",
        "Priority conditions: Depression, Psychosis, Epilepsy, Dementia, Child disorders, Self-harm.",
        "Structured assessment flow: Identify symptoms -> Assess for other conditions -> Manage."
      ]
    }
  }
};
