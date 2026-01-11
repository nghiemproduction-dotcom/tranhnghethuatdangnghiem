'use server'

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

const BASE_DIR = path.join(process.cwd(), 'app', 'phonglamviec', 'cacchucnang');
const CLIENT_FILE_PATH = path.join(process.cwd(), 'app', 'phonglamviec', 'PhongLamViecClient.tsx');

// --- UTILS ---
function sanitizeName(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]/g, '').trim();
}
function toPascalCase(str: string) {
    const clean = sanitizeName(str);
    return clean.charAt(0).toUpperCase() + clean.slice(1);
}
function toConstantCase(str: string) {
    return sanitizeName(str).replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '');
}

// --- DATABASE FUNCTIONS ---
export async function fetchDbTables() {
    try {
        const supabase = await createClient();
        const { data } = await supabase.rpc('get_all_tables');
        return data.map((t: any) => t.table_name);
    } catch { return []; }
}

export async function fetchDbColumns(tableName: string) {
    try {
        const supabase = await createClient();
        const { data } = await supabase.rpc('get_table_columns', { target_table: tableName });
        return data;
    } catch { return []; }
}

export async function fetchUserRoles() {
    try {
        const supabase = await createClient();
        const { data } = await supabase.from('nhan_su').select('phan_loai');
        return Array.from(new Set((data || []).map((item: any) => item.phan_loai))).filter(Boolean) as string[];
    } catch { return ['admin', 'quanly', 'nhanvien']; }
}

// --- DEEP ANALYSIS ---
function guessTypeFromData(values: any[]): string {
    const validValues = values.filter(v => v !== null && v !== undefined && v !== '');
    if (validValues.length === 0) return 'text'; 
    const sample = validValues[0];

    const isImage = validValues.every(v => {
        const s = String(v).toLowerCase();
        return s.startsWith('http') || s.startsWith('data:image') || s.match(/\.(jpeg|jpg|gif|png|webp|svg)$/);
    });
    if (isImage) return 'image';

    const isDate = validValues.every(v => !isNaN(Date.parse(String(v))) && String(v).includes('-') && (String(v).includes(':') || String(v).length === 10));
    if (isDate) return 'date';

    if (validValues.length > 5) {
        const uniqueCount = new Set(validValues).size;
        if ((uniqueCount / validValues.length) < 0.3) return 'select'; 
    }

    if (validValues.some(v => String(v).length > 60)) return 'textarea';
    if (typeof sample === 'number') return 'number';
    if (typeof sample === 'boolean') return 'checkbox';

    return 'text';
}

export async function deepAnalyzeTable(tableName: string) {
    const supabase = await createClient();
    const { data: columns } = await supabase.rpc('get_table_columns', { target_table: tableName });
    if (!columns) throw new Error("Không thể đọc cấu trúc bảng");

    const { data: sampleRows } = await supabase.from(tableName).select('*').limit(20);
    const hasData = sampleRows && sampleRows.length > 0;

    const processedCols = columns.map((c: any) => {
        const colKey = c.column_name;
        let inputType = 'text';
        
        if (c.data_type === 'boolean') inputType = 'checkbox';
        else if (c.data_type.includes('int') || c.data_type.includes('numeric')) inputType = 'number';
        else if (c.data_type.includes('json')) inputType = 'textarea';
        
        if (hasData && (c.data_type.includes('text') || c.data_type.includes('char') || c.data_type.includes('uuid'))) {
            const values = sampleRows.map((row: any) => row[colKey]);
            const guessed = guessTypeFromData(values);
            if (guessed !== 'text') inputType = guessed;
        }
        if (c.data_type === 'uuid' && colKey !== 'id') inputType = 'text';

        return {
            key: colKey, originalType: c.data_type,
            label: toPascalCase(colKey).replace(/([A-Z])/g, ' $1').trim(),
            inputType: inputType,
            showInList: colKey !== 'id', 
            showInForm: !['id', 'created_at', 'updated_at', 'tao_luc'].includes(colKey), 
            required: c.is_nullable === 'NO' && colKey !== 'id',
            isOwnerField: false, placeholder: ''
        };
    });

    let bestTitle = 'id';
    if (hasData) {
        const candidate = processedCols.find((c: any) => {
            if (['id', 'image', 'date', 'textarea', 'checkbox'].includes(c.inputType)) return false;
            const unique = new Set(sampleRows.map((r: any) => r[c.key])).size;
            return unique > (sampleRows.length * 0.5); 
        });
        if (candidate) bestTitle = candidate.key;
    } else {
        const nameCol = processedCols.find((c:any) => ['name','ten','title','tieu_de'].some(k => c.key.includes(k)));
        if (nameCol) bestTitle = nameCol.key;
    }

    const bestImage = processedCols.find((c: any) => c.inputType === 'image')?.key || '';
    const bestSub = processedCols.find((c: any) => c.key !== 'id' && c.key !== bestTitle && c.key !== bestImage && ['text', 'select', 'number'].includes(c.inputType))?.key || '';
    const bestSort = processedCols.find((c: any) => c.inputType === 'date')?.key || 'id';
    const bestFilter = processedCols.find((c: any) => c.inputType === 'select')?.key || '';
    const hasNumberCol = processedCols.some((c:any) => c.inputType === 'number' && c.key !== 'id');
    
    return {
        columns: processedCols,
        displaySettings: { colTitle: bestTitle, colSubTitle: bestSub, colImage: bestImage },
        tabFilterColumn: bestFilter,
        dalConfig: { sortColumn: bestSort, sortOrder: 'desc' },
        suggestions: { possibleGameMode: hasNumberCol }
    };
}

// --- FILE OPERATIONS ---
export async function fetchExistingFeatures() {
    try {
        await fs.access(BASE_DIR).catch(() => fs.mkdir(BASE_DIR, { recursive: true }));
        const items = await fs.readdir(BASE_DIR, { withFileTypes: true });
        return items.filter(d => d.isDirectory() && !['GenericChucNang'].includes(d.name) && !d.name.startsWith('.')).map(d => d.name);
    } catch { return []; }
}

export async function createFeatureFolder(folderName: string) {
    const cleanName = sanitizeName(folderName).toLowerCase();
    const dirPath = path.join(BASE_DIR, cleanName);
    try {
        await fs.mkdir(dirPath, { recursive: true });
        return { success: true, path: dirPath, cleanName };
    } catch (e: any) { return { success: false, message: e.message }; }
}

export async function deleteFeatureFolder(folderName: string) {
    try {
        await unregisterFeatureInClient(folderName);
        await fs.rm(path.join(BASE_DIR, folderName), { recursive: true, force: true });
        return { success: true };
    } catch (e: any) { return { success: false, message: e.message }; }
}

export async function writeFeatureFile(folderName: string, fileName: string, content: string) {
    try {
        await fs.writeFile(path.join(BASE_DIR, folderName, fileName), content, 'utf8');
        return { success: true };
    } catch (e: any) { return { success: false, message: e.message }; }
}

export async function saveFeatureMeta(folderName: string, metaData: any) {
    return writeFeatureFile(folderName, 'generator-meta.json', JSON.stringify(metaData, null, 2));
}

export async function loadFeatureMeta(folderName: string) {
    try {
        const content = await fs.readFile(path.join(BASE_DIR, folderName, 'generator-meta.json'), 'utf8');
        return JSON.parse(content);
    } catch { return null; }
}

export async function scanForTabs(folderName: string) {
    try {
        const files = await fs.readdir(path.join(BASE_DIR, folderName));
        return files.filter(f => f.startsWith('Tab') && f.endsWith('.tsx')).map(f => ({
            fileName: f,
            componentName: f.replace('.tsx', ''),
            importPath: `./${f.replace('.tsx', '')}`,
            label: f.replace('.tsx', '').replace(/Tab/g, '').replace(/([A-Z])/g, ' $1').trim(),
            iconName: 'Layout'
        }));
    } catch { return []; }
}

// --- CODE GENERATORS ---

export const generateConfigContent = (folderName: string, meta: any, selectedTabs: any[], linkedModules: any[]) => {
    const CONST_NAME = toConstantCase(folderName);
    
    // 1. Import Tabs nội bộ (cùng folder)
    const localTabsImport = selectedTabs.map(t => `import ${t.componentName} from '${t.importPath}'`).join('\n');
    
    // 2. Import Module liên kết (Relation Tabs)
    let linkedTabsImport = '';
    let linkedTabsConfig = '';

    if (linkedModules && linkedModules.length > 0) {
        linkedTabsImport += `import GenericRelationTab from '../GenericChucNang/GenericRelationTab';\n`;
        // [FIX] Thêm import icon Link từ lucide-react
        linkedTabsImport += `import { Link } from 'lucide-react';\n`; 
        
        linkedModules.forEach(mod => {
            const MOD_CONST = toConstantCase(mod.moduleName);
            // Import config từ module khác
            linkedTabsImport += `import { ${MOD_CONST}_FIELDS, ${MOD_CONST}_DISPLAY_CONFIG } from '../${mod.moduleName}/config';\n`;
            
            // [FIX] Sử dụng icon: Link thay vì null
            linkedTabsConfig += `
  { 
    id: 'tab_${mod.moduleName}', 
    label: '${mod.label || mod.moduleName}', 
    icon: Link, 
    content: (
        <GenericRelationTab 
            tableName="${mod.tableName}" 
            foreignKey="${mod.foreignKey}" 
            parentId={item.id} 
            fields={${MOD_CONST}_FIELDS} 
            displayConfig={${MOD_CONST}_DISPLAY_CONFIG} 
        />
    )
  },`;
        });
    }

    // 3. Tạo Fields Array
    const fields = meta.columns.map((c:any) => {
        const extra = [];
        if(c.required) extra.push('required: true');
        if(c.placeholder) extra.push(`placeholder: "${c.placeholder}"`);
        return `  { key: "${c.key}", label: "${c.label}", type: "${c.inputType}", showInList: ${c.showInList}, showInForm: ${c.showInForm}, ${extra.join(', ')} },`;
    });

    const dSet = meta.displaySettings || {};
    const gamificationConfig = meta.isGameMode 
        ? `gamification: { hasRank: true, rankKey: 'cap_bac_game', scoreKey: 'diem_cong_hien' },`
        : `gamification: { hasRank: false },`;
    const bucketConfig = meta.storageBucket ? `storageBucket: '${meta.storageBucket}',` : '';

    return `import { FieldConfig } from "@/app/types/core";
import { GenericDisplayConfig } from "../GenericChucNang/GenericList";
${localTabsImport}
${linkedTabsImport}

export const ${CONST_NAME}_FIELDS: FieldConfig[] = [
${fields.join('\n')}
];

export const ${CONST_NAME}_DISPLAY_CONFIG: GenericDisplayConfig & { storageBucket?: string } = {
    colTitle: '${dSet.colTitle || 'id'}',
    colSubTitle: '${dSet.colSubTitle || ''}',
    colImage: '${dSet.colImage || ''}',
    ${meta.tabFilterColumn ? `tabFilterKey: '${meta.tabFilterColumn}',` : ''}
    ${bucketConfig}
    ${gamificationConfig}
};

export const ${CONST_NAME}_TABS = (item: any) => [
${selectedTabs.map(t => `  { id: '${t.componentName}', label: '${t.label}', icon: null, content: <${t.componentName} item={item} /> },`).join('\n')}
${linkedTabsConfig}
];`; 
};

export const generateDtoContent = (folderName: string, meta: any) => {
    const TypeName = toPascalCase(folderName);
    const dtoLines = meta.columns.filter((c:any) => c.key !== 'id') 
        .map((c:any) => `    ${c.key}: ${['number'].includes(c.inputType) ? 'number' : 'string'};`);
    const mapLines = meta.columns.map((c:any) => {
        if (c.key === 'id') return `        id: raw.id,`;
        let defaultVal = "''";
        if (['number'].includes(c.inputType)) defaultVal = '0';
        return `        ${c.key}: raw.${c.key} ?? ${defaultVal},`;
    });

    if (meta.isGameMode) {
        if (!meta.columns.find((c:any) => c.key === 'cap_bac_game')) {
            dtoLines.push(`    cap_bac_game: string;`);
            mapLines.push(`        cap_bac_game: raw.cap_bac_game ?? 'Tân Binh',`);
        }
        if (!meta.columns.find((c:any) => c.key === 'diem_cong_hien')) {
            dtoLines.push(`    diem_cong_hien: number;`);
            mapLines.push(`        diem_cong_hien: raw.diem_cong_hien ?? 0,`);
        }
    }
    return `export type ${TypeName}DTO = {\n    id: string;\n${dtoLines.join('\n')}\n};\n\nexport function to${TypeName}DTO(raw: any): ${TypeName}DTO {\n    return {\n${mapLines.join('\n')}\n    };\n}`;
}

export const generateDalContent = (folderName: string, meta: any) => {
    const TypeName = toPascalCase(folderName);
    const forcedCols = ['id', 'hinh_anh'];
    if (meta.isGameMode) forcedCols.push('cap_bac_game', 'diem_cong_hien');
    
    const publicCols = meta.columns
        .filter((c:any) => c.showInList || forcedCols.includes(c.key))
        .map((c:any) => c.key)
        .join(',');

    return `import 'server-only'
import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import { fetchGenericData } from '@/app/phonglamviec/generic-fetch'
import { ${TypeName}DTO, to${TypeName}DTO } from './dto'

export const getDs${TypeName} = cache(async (): Promise<${TypeName}DTO[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isVip = false;
  if (user) {
     const { data: info } = await supabase.from('nhan_su').select('phan_loai').eq('id', user.id).single();
     const role = info?.phan_loai || '';
     isVip = ['admin', 'quanly'].includes(role.toLowerCase());
  }
  const columnsToSelect = isVip ? '*' : '${publicCols}';
  const rawData = await fetchGenericData<any>(
      '${meta.tableName}', 
      columnsToSelect, 
      { column: '${meta.dalConfig.sortColumn}', ascending: ${meta.dalConfig.sortOrder === 'asc'} }
  );
  return rawData.map(to${TypeName}DTO);
})`;
}

export const generateTabThanhTichContent = (folderName: string) => {
    const TypeName = toPascalCase(folderName);
    return `'use client'
import { useMemo } from 'react'
import { Trophy, Star, Target, Shield, Zap, Medal } from 'lucide-react'
import { ${TypeName}DTO } from './dto'

export default function TabThanhTich({ item }: { item: ${TypeName}DTO }) {
  const gameStats = useMemo(() => {
    const currentExp = item.diem_cong_hien || 0;
    const nextLevelExp = 1000; 
    const percent = Math.min((currentExp / nextLevelExp) * 100, 100);
    return { level: item.cap_bac_game || 'Tân Binh', exp: currentExp, nextLevelExp, percent };
  }, [item]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#111] p-5 rounded-lg border border-white/5 relative overflow-hidden group hover:border-[#C69C6D]/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} /></div>
            <div className="flex justify-between items-end mb-2 relative z-10">
                <div><p className="text-[10px] text-gray-500 font-bold uppercase">Current Rank</p><h3 className="text-2xl font-black text-[#C69C6D]">{gameStats.level}</h3></div>
                <div className="text-right"><span className="text-[#C69C6D] font-bold text-xl">{gameStats.exp}</span><span className="text-gray-600 text-xs"> / {gameStats.nextLevelExp} XP</span></div>
            </div>
            <div className="h-3 w-full bg-black rounded-full overflow-hidden border border-white/10"><div className="h-full bg-gradient-to-r from-[#C69C6D] to-yellow-300" style={{ width: \`\${gameStats.percent}%\` }} /></div>
        </div>
        <div className="text-center text-xs text-gray-500 uppercase">Module Gamification (Auto-Generated)</div>
    </div>
  )
}`;
}

// --- CLIENT REGISTRATION ---
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function unregisterFeatureInClient(folderName: string) {
    try {
        let content = await fs.readFile(CLIENT_FILE_PATH, 'utf8');
        
        const startMarkerImp = `// [AUTO-GEN-IMPORT-START: ${folderName}]`;
        const endMarkerImp = `// [AUTO-GEN-IMPORT-END: ${folderName}]`;
        const regexImp = new RegExp(`${escapeRegExp(startMarkerImp)}[\\s\\S]*?${escapeRegExp(endMarkerImp)}`, 'g');
        
        const startMarkerBlock = `// [AUTO-GEN-BLOCK-START: ${folderName}]`;
        const endMarkerBlock = `// [AUTO-GEN-BLOCK-END: ${folderName}]`;
        const regexBlock = new RegExp(`${escapeRegExp(startMarkerBlock)}[\\s\\S]*?${escapeRegExp(endMarkerBlock)},?`, 'g');

        if (content.includes(startMarkerImp)) {
            content = content.replace(regexImp, '').replace(regexBlock, '');
        } else {
            const importPath = `@/app/phonglamviec/cacchucnang/${folderName}/config`;
            content = content.split('\n').filter(line => !line.includes(importPath)).join('\n');
            const blockRegexBasic = new RegExp(`\\s*\\{\\s*id:\\s*['"]${folderName}['"][\\s\\S]*?\\},?`, 'g');
            if (content.includes(`id: '${folderName}'`) || content.includes(`id: "${folderName}"`)) {
                 content = content.replace(blockRegexBasic, '');
            }
        }
        content = content.replace(/^\s*[\r\n]/gm, '');
        await fs.writeFile(CLIENT_FILE_PATH, content, 'utf8');
        return { success: true };
    } catch (e: any) { return { success: false, message: e.message }; }
}

export async function registerFeatureInClientSmart(folderName: string, featureLabel: string, tableName: string) {
    await unregisterFeatureInClient(folderName);
    try {
        let content = await fs.readFile(CLIENT_FILE_PATH, 'utf8');
        const CONST_NAME = toConstantCase(folderName);
        
        const importCode = `
// [AUTO-GEN-IMPORT-START: ${folderName}]
import { ${CONST_NAME}_FIELDS, ${CONST_NAME}_DISPLAY_CONFIG, ${CONST_NAME}_TABS } from '@/app/phonglamviec/cacchucnang/${folderName}/config'
// [AUTO-GEN-IMPORT-END: ${folderName}]`;

        const configCode = `
            // [AUTO-GEN-BLOCK-START: ${folderName}]
            {
                id: '${folderName}', 
                label: '${featureLabel}', 
                icon: Package, 
                type: 'dynamic', 
                tableName: '${tableName}',
                fields: ${CONST_NAME}_FIELDS, 
                displayConfig: ${CONST_NAME}_DISPLAY_CONFIG,
                getAdditionalTabs: (item) => ${CONST_NAME}_TABS(item)
            },
            // [AUTO-GEN-BLOCK-END: ${folderName}]`;

        const importMarker = `import { NHAN_SU_FIELDS`;
        if (content.includes(importMarker)) {
            content = content.replace(importMarker, `${importCode}\n${importMarker}`);
        } else {
            content = `${importCode}\n${content}`;
        }

        const arrayMarker = `const allFunctions = useMemo<FunctionItem[]>(() => {
        return [`;
        if (content.includes(arrayMarker)) {
             content = content.replace(arrayMarker, `${arrayMarker}${configCode}`);
        } else {
             const oldMarker = `return [`;
             if(content.includes(oldMarker)) content = content.replace(oldMarker, `${oldMarker}${configCode}`);
        }

        await fs.writeFile(CLIENT_FILE_PATH, content, 'utf8');
        return { success: true };
    } catch (e: any) { return { success: false, message: e.message }; }
}