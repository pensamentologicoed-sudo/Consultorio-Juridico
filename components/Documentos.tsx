import React, { useEffect, useState, useRef } from 'react';
import { FileText, Download, Eye, UploadCloud, Search, Loader2, AlertCircle } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { AppDocument } from '../types';
import DeleteButton from './DeleteButton';

const Documentos: React.FC = () => {
  const { documents, loading, uploading, error, fetchDocuments, uploadDocuments } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments(searchTerm);
  }, [fetchDocuments, searchTerm]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        await uploadDocuments(e.target.files);
        // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await uploadDocuments(e.dataTransfer.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDeleted = (success: boolean) => {
    if (success) {
      fetchDocuments(searchTerm);
    }
  };

  // Helper para formatar tamanho
  const formatSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Infere a cor e o tipo baseando-se no campo type OU na extensão do nome
  const getTypeColor = (doc: AppDocument) => {
    const typeStr = doc.type || doc.name.split('.').pop() || 'file';
    const t = typeStr.toLowerCase();
    
    if (t.includes('pdf')) return 'bg-red-100 text-red-700';
    if (t.includes('word') || t.includes('doc')) return 'bg-blue-100 text-blue-700';
    if (t.includes('excel') || t.includes('sheet') || t.includes('xls')) return 'bg-green-100 text-green-700';
    if (t.includes('image') || t.includes('png') || t.includes('jpg') || t.includes('jpeg')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getDisplayType = (doc: AppDocument) => {
      return (doc.type || doc.name.split('.').pop() || 'FILE').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="mt-1 text-sm text-gray-500">Repositório digital de arquivos</p>
        </div>
        <div className="flex gap-2">
            {/* Input Invisível */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileSelect} 
            />
            
            <button 
                onClick={triggerFileInput}
                disabled={uploading}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
               Upload em Massa
            </button>
            <button 
                onClick={triggerFileInput}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm disabled:opacity-50"
            >
               {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
               Novo Documento
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center text-sm border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
        </div>
      )}

      {/* Stats (Calculados dinamicamente) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Arquivos</p>
            <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Tamanho</p>
            <p className="text-2xl font-bold text-gray-900">
                {formatSize(documents.reduce((acc, doc) => acc + (doc.size || 0), 0))}
            </p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">PDFs</p>
            <p className="text-2xl font-bold text-red-600">
                {documents.filter(d => (d.type || d.name).toLowerCase().includes('pdf')).length}
            </p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold">Recentes (Hoje)</p>
            <p className="text-2xl font-bold text-blue-600">
                {documents.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString()).length}
            </p>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <input 
                type="text" 
                placeholder="Buscar documentos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
             />
          </div>
          <div className="flex gap-2">
             <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm outline-none">
                <option>Todos os Tipos</option>
                <option>Petições</option>
                <option>Contratos</option>
             </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Blue Header */}
        <div className="px-6 py-4 border-b border-blue-500 bg-blue-600 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-white" />
                Lista de Documentos
            </h3>
            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                {documents.length}
            </span>
        </div>

        {loading && documents.length === 0 ? (
             <div className="p-12 text-center text-gray-400">
                 <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                 Carregando documentos...
             </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processo/Ref</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {documents.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            Nenhum documento encontrado. Faça um upload para começar.
                        </td>
                    </tr>
                ) : (
                    documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={doc.name}>{doc.name}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(doc)}`}>
                        {getDisplayType(doc)}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {doc.case_title || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                        <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                            title="Visualizar"
                        >
                            <Eye className="w-4 h-4" />
                        </a>
                        <a 
                             href={`${doc.url}?download=`} 
                             download
                             className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                             title="Download"
                        >
                             <Download className="w-4 h-4" />
                        </a>
                        <DeleteButton 
                           tableName="documents" 
                           recordId={doc.id} 
                           recordName={doc.name} 
                           onDelete={handleDeleted}
                           variant="ghost"
                           size="sm"
                           showLabel={false}
                           className="text-gray-400 hover:text-red-600 p-2 rounded-full"
                        />
                        </div>
                    </td>
                    </tr>
                ))
                )}
                </tbody>
            </table>
            </div>
        )}
      </div>
      
      {/* Upload Zone */}
      <div 
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            uploading ? 'border-blue-300 bg-blue-50 opacity-50 cursor-wait' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
        }`}
      >
         {uploading ? (
            <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-spin" />
                <p className="text-blue-900 font-medium">Enviando arquivos...</p>
            </div>
         ) : (
            <>
                <UploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-900 font-medium">Clique ou arraste arquivos aqui</p>
                <p className="text-sm text-gray-500 mt-1">PDF, DOCX, JPG até 10MB</p>
            </>
         )}
      </div>
    </div>
  );
};

export default Documentos;