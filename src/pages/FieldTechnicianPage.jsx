import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getTechnicianTasks, completeInstallationTask, returnTaskToHold } from '../lib/supabase';
import { compressImage } from '../lib/image-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LogOut, Camera, UploadCloud, Loader2, RotateCcw, Package, MapPin } from 'lucide-react';
import { RouteGenerator } from '@/components/RouteGenerator';
import { Badge } from '@/components/ui/badge';

const kitTypeMap = {
  kit_completo: 'Kit Completo',
  kit_placas: 'Kit Placas',
  troca_propaganda: 'Troca de Propaganda',
};

function FieldTechnicianPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [comments, setComments] = useState({});
  const [uploading, setUploading] = useState({});
  const [returning, setReturning] = useState({});
  const [compressing, setCompressing] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const tasksData = await getTechnicianTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Não foi possível carregar as tarefas.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const allPendingPoints = useMemo(() => {
    return tasks
      .map(task => task.points)
      .filter(p => p && p.latitude && p.longitude);
  }, [tasks]);

  const handleFileChange = async (pointId, file) => {
    if (!file) {
      setSelectedFiles(prev => ({ ...prev, [pointId]: null }));
      return;
    }
    setCompressing(prev => ({ ...prev, [pointId]: true }));
    try {
      const compressedFile = await compressImage(file);
      setSelectedFiles(prev => ({ ...prev, [pointId]: compressedFile }));
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Erro ao processar imagem.", { description: "Por favor, tente um arquivo diferente." });
      setSelectedFiles(prev => ({ ...prev, [pointId]: null }));
    } finally {
      setCompressing(prev => ({ ...prev, [pointId]: false }));
    }
  };

  const handleCommentChange = (pointId, text) => {
    setComments(prev => ({ ...prev, [pointId]: text }));
  };

  const handleCompleteTask = async (taskId, pointId, file, comment) => {
    if (!file) {
      toast.warning('Por favor, selecione uma foto para concluir a tarefa.');
      return;
    }
    setUploading(prev => ({ ...prev, [pointId]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${pointId}-${Date.now()}.${fileExt}`;
      
      // 1. Upload da Imagem
      const { error: uploadError } = await supabase.storage.from('installation-photos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Adicionado upsert: true para garantir que não haja conflito de nome
      });
      if (uploadError) {
        console.error("Upload Error:", uploadError);
        throw new Error(`Falha no upload: ${uploadError.message}`);
      }

      // 2. Obter URL Pública
      const { data: urlData } = supabase.storage.from('installation-photos').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      
      if (!publicUrl) {
        throw new Error("Não foi possível obter a URL pública após o upload.");
      }

      // 3. Atualizar Ponto no DB
      const { error: updateError } = await supabase
        .from('points')
        .update({ 
          installation_photo_url: publicUrl,
          installation_notes: comment || null
        })
        .eq('id', pointId);
      if (updateError) {
        console.error("DB Update Error:", updateError);
        throw new Error(`Falha ao atualizar ponto: ${updateError.message}`);
      }

      // 4. Concluir Tarefa
      await completeInstallationTask(taskId);

      toast.success('Tarefa concluída com sucesso!');
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    } catch (error) {
      console.error("Error completing task:", error);
      // Exibe a mensagem de erro detalhada
      toast.error(`Falha ao concluir tarefa: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setUploading(prev => ({ ...prev, [pointId]: false }));
    }
  };

  const handleReturnToHold = async (taskId, pointId, comment) => {
    if (!comment) {
      toast.warning('É obrigatório adicionar um comentário para devolver a tarefa.');
      return;
    }
    setReturning(prev => ({ ...prev, [pointId]: true }));
    try {
      await returnTaskToHold(taskId, pointId, comment);
      toast.success('Tarefa devolvida para pendências.');
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error returning task:", error);
      toast.error(`Falha ao devolver tarefa: ${error.message}`);
    } finally {
      setReturning(prev => ({ ...prev, [pointId]: false }));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /> Carregando tarefas...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Painel do Técnico</h1>
          <p className="text-gray-600">Tarefas de instalação de placas</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main>
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">
            <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma instalação pendente no momento.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <RouteGenerator points={allPendingPoints} />
            <Card>
              <CardHeader>
                {/* Forçando cores brancas para o título e descrição */}
                <CardTitle className="text-white">Minhas Tarefas de Instalação</CardTitle>
                <CardDescription className="text-white/90">
                  Complete as tarefas abaixo enviando a foto da placa instalada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.map(task => {
                  const point = task.points;
                  const address = point.street_name + (point.intersection_name ? ` c/ ${point.intersection_name}` : '');
                  const kitLabel = kitTypeMap[task.kit_type] || 'Tipo de Kit Indefinido';

                  return (
                    <div key={task.id} className="p-4 border rounded-md bg-white shadow-sm space-y-4">
                      <div className="space-y-1">
                        {/* Nome do Ponto: Usando text-gray-900 para garantir contraste */}
                        <p className="font-bold text-lg text-gray-900">{point.name}</p>
                        
                        {/* Endereço */}
                        <p className="text-sm text-gray-700 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                          {address}
                        </p>
                        
                        {/* Cliente e Kit Type */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Badge variant="secondary" className="text-sm">
                            Cliente: {task.customer_name || 'N/A'}
                          </Badge>
                          <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                            <Package className="h-3 w-3 mr-1" />
                            Kit: {kitLabel}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(task.points.id, e.target.files[0])} 
                          disabled={uploading[task.points.id] || compressing[task.points.id] || returning[task.points.id]} 
                        />
                        {compressing[task.points.id] && <p className="text-sm text-gray-600 flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Comprimindo imagem...</p>}
                        <Textarea 
                          placeholder="Adicionar um comentário (obrigatório para devolver)..."
                          value={comments[task.points.id] || ''}
                          onChange={(e) => handleCommentChange(task.points.id, e.target.value)}
                          disabled={uploading[task.points.id] || returning[task.points.id]}
                        />
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <Button 
                            onClick={() => handleCompleteTask(task.id, task.points.id, selectedFiles[task.points.id], comments[task.points.id])} 
                            disabled={!selectedFiles[task.points.id] || uploading[task.points.id] || compressing[task.points.id] || returning[task.points.id]}
                            className="w-full sm:w-auto flex-1"
                          >
                            {uploading[task.points.id] ? <Loader2 className="animate-spin" /> : <><UploadCloud className="h-4 w-4 mr-2" /> Concluir Instalação</>}
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleReturnToHold(task.id, task.points.id, comments[task.points.id])}
                            disabled={uploading[task.points.id] || returning[task.points.id]}
                            className="w-full sm:w-auto flex-1"
                          >
                            {returning[task.points.id] ? <Loader2 className="animate-spin" /> : <><RotateCcw className="h-4 w-4 mr-2" /> Devolver para Pendências</>}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default FieldTechnicianPage;