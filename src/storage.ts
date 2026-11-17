import { Theme, Role, Client, Audit, DocRecord, FinanceRecord } from "./types";
import { DEMO_CLIENTS, DEMO_AUDITS, DEMO_DOCUMENTS, DEMO_FINANCES } from "./demoData";
import { AI_SOLUTIONS, AISolution, saveSolution } from "./auditMetadata";
import { RULES_REGISTRY, Rule, saveRule } from "./lib/rulesRegistry";

export interface ReportBranding {
  companyName: string;
  auditorName: string;
  auditorRole: string;
  phone: string;
  email: string;
  website: string;
  accentColor: string;
}

export const DEFAULT_BRANDING: ReportBranding = {
  companyName: 'AI Audit Enterprise Platform',
  auditorName: 'Алексей Смирнов',
  auditorRole: 'Ведущий эксперт по AI-трансформации',
  phone: '+7 (495) 123-45-67',
  email: 'expert@ai-audit.platform',
  website: 'ai-audit.platform',
  accentColor: '#1E3A8A'
};

const PREFIX = 'aiaudit:';

interface StorageAPI {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  getTheme(): Theme;
  setTheme(theme: Theme): void;
  getRole(): Role;
  setRole(role: Role): void;
  
  // Domain data
  getClients(): Client[];
  saveClient(client: Client): void;
  getAudits(): Audit[];
  saveAudit(audit: Audit): void;
  getDocuments(): DocRecord[];
  saveDocument(doc: DocRecord): void;
  getFinances(): FinanceRecord[];
  getSolutions(): AISolution[];
  saveSolution(solution: AISolution): void;
  getRules(): Rule[];
  saveRule(rule: Rule): void;
  
  // Branding
  getBranding(): ReportBranding;
  saveBranding(branding: ReportBranding): void;

  hasDemoData(): boolean;
  loadDemoData(): void;
  clearAll(): void;
}

export const storage: StorageAPI = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },

  getTheme(): Theme {
    return (storage.get<Theme>('theme')) || 'light';
  },

  setTheme(theme: Theme): void {
    storage.set('theme', theme);
  },

  getRole(): Role {
    return (storage.get<Role>('role')) || 'ADMIN';
  },

  setRole(role: Role): void {
    storage.set('role', role);
  },

  getClients(): Client[] {
    return storage.get<Client[]>('clients') || [];
  },

  saveClient(client: Client): void {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
      clients[index] = client;
    } else {
      clients.push(client);
    }
    storage.set('clients', clients);
  },

  getAudits(): Audit[] {
    const audits = storage.get<Audit[]>('audits') || [];
    if (audits.length === 0) return [];

    const hasAnyCompanyData = audits.some(a => a.companyData !== undefined);
    if (!hasAnyCompanyData) {
      const merged = audits.map(a => {
        const demo = DEMO_AUDITS.find(d => d.id === a.id);
        if (demo?.companyData) {
          return {
            ...a,
            companyData: demo.companyData,
            solutions: demo.solutions,
            wizardStep: demo.wizardStep
          };
        }
        return a;
      });
      storage.set('audits', merged);
      return merged;
    }
    return audits;
  },

  saveAudit(audit: Audit): void {
    const audits = this.getAudits();
    const index = audits.findIndex(a => a.id === audit.id);
    if (index >= 0) {
      audits[index] = audit;
    } else {
      audits.push(audit);
    }
    storage.set('audits', audits);
  },

  getDocuments(): DocRecord[] {
    return storage.get<DocRecord[]>('documents') || [];
  },

  saveDocument(doc: DocRecord): void {
    const docs = this.getDocuments();
    const index = docs.findIndex(d => d.id === doc.id);
    if (index >= 0) {
      docs[index] = doc;
    } else {
      docs.push(doc);
    }
    storage.set('documents', docs);
  },

  getFinances(): FinanceRecord[] {
    return storage.get<FinanceRecord[]>('finances') || [];
  },

  getSolutions(): AISolution[] {
    return AI_SOLUTIONS;
  },

  saveSolution(solution: AISolution): void {
    saveSolution(solution);
  },

  getRules(): Rule[] {
    return RULES_REGISTRY;
  },

  saveRule(rule: Rule): void {
    saveRule(rule);
  },

  getBranding(): ReportBranding {
    const saved = storage.get<ReportBranding>('report_branding');
    if (saved) return saved;
    return DEFAULT_BRANDING;
  },

  saveBranding(branding: ReportBranding): void {
    storage.set('report_branding', branding);
  },

  hasDemoData(): boolean {
    const clients = this.getClients();
    return clients.some(c => c.isDemo);
  },

  loadDemoData(): void {
    storage.set('clients', DEMO_CLIENTS);
    storage.set('audits', DEMO_AUDITS);
    storage.set('documents', DEMO_DOCUMENTS);
    storage.set('finances', DEMO_FINANCES);
  },

  clearAll(): void {
    storage.remove('clients');
    storage.remove('audits');
    storage.remove('documents');
    storage.remove('finances');
    storage.remove('solutions');
  }
};
