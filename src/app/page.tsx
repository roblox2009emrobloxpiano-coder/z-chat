'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, MessageCircle, Plus, Send, Sparkles, Trash2 } from 'lucide-react'

interface Character {
  id: string
  name: string
  description: string
  avatar: string
  personality: string
  greeting: string
  category: string
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
}

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    description: '',
    avatar: '👤',
    personality: '',
    greeting: '',
    category: 'Outros'
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Carregar personagens
  useEffect(() => {
    fetchCharacters()
  }, [])

  // Scroll para baixo quando novas mensagens chegarem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Carregar histórico do localStorage quando selecionar personagem
  useEffect(() => {
    if (selectedCharacter) {
      const saved = localStorage.getItem(`chat_${selectedCharacter.id}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.length > 0) {
            setMessages(parsed)
            return
          }
        } catch {
          // ignore
        }
      }
      // Mensagem de boas-vindas
      setMessages([{
        id: 'greeting',
        content: selectedCharacter.greeting,
        role: 'assistant',
        createdAt: new Date().toISOString()
      }])
    }
  }, [selectedCharacter])

  // Salvar mensagens no localStorage
  useEffect(() => {
    if (selectedCharacter && messages.length > 0) {
      localStorage.setItem(`chat_${selectedCharacter.id}`, JSON.stringify(messages))
    }
  }, [messages, selectedCharacter])

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters')
      const data = await response.json()
      setCharacters(data)
    } catch (error) {
      console.error('Error fetching characters:', error)
    }
  }

  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character)
    setInputMessage('')
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedCharacter || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    // Adicionar mensagem do usuário imediatamente
    const tempUserMsg: Message = {
      id: 'temp-' + Date.now(),
      content: userMessage,
      role: 'user',
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: selectedCharacter.id,
          message: userMessage,
          history: messages.filter(m => m.id !== 'greeting')
        })
      })

      const data = await response.json()

      if (data.response) {
        const assistantMessage: Message = {
          id: 'msg-' + Date.now(),
          content: data.response,
          role: 'assistant',
          createdAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        content: 'Desculpe, houve um erro. Tente novamente.',
        role: 'assistant',
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const createCharacter = async () => {
    if (!newCharacter.name || !newCharacter.personality || !newCharacter.greeting) return

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCharacter)
      })

      if (response.ok) {
        await fetchCharacters()
        setIsCreateOpen(false)
        setNewCharacter({
          name: '',
          description: '',
          avatar: '👤',
          personality: '',
          greeting: '',
          category: 'Outros'
        })
      }
    } catch (error) {
      console.error('Error creating character:', error)
    }
  }

  const clearHistory = () => {
    if (selectedCharacter) {
      localStorage.removeItem(`chat_${selectedCharacter.id}`)
    }
    setMessages([{
      id: 'greeting',
      content: selectedCharacter?.greeting || '',
      role: 'assistant',
      createdAt: new Date().toISOString()
    }])
  }

  const categories = [...new Set(characters.map(c => c.category))]

  // Tela de Chat
  if (selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
        {/* Header do Chat */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedCharacter(null)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                {selectedCharacter.avatar}
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">{selectedCharacter.name}</h2>
                <p className="text-sm text-white/60">{selectedCharacter.category}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearHistory}
              className="text-white hover:bg-white/10"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Área de Mensagens */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white backdrop-blur'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-white/60">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input de Mensagem */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Tela Principal - Lista de Personagens
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Z-Chat</h1>
                <p className="text-sm text-white/60">Sua plataforma de personagens AI</p>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Personagem
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/20 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Personagem</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Crie seu próprio personagem com personalidade única
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Nome</Label>
                      <Input
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                        className="bg-white/10 border-white/20 text-white mt-1"
                        placeholder="Nome do personagem"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Avatar (Emoji)</Label>
                      <Input
                        value={newCharacter.avatar}
                        onChange={(e) => setNewCharacter({ ...newCharacter, avatar: e.target.value })}
                        className="bg-white/10 border-white/20 text-white mt-1"
                        placeholder="🧙‍♀️"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/80">Descrição</Label>
                    <Input
                      value={newCharacter.description}
                      onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white mt-1"
                      placeholder="Descrição do personagem"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Personalidade</Label>
                    <Textarea
                      value={newCharacter.personality}
                      onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
                      className="bg-white/10 border-white/20 text-white mt-1"
                      placeholder="Ex: Gentil, misterioso, brincalhão..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Mensagem de Boas-vindas</Label>
                    <Textarea
                      value={newCharacter.greeting}
                      onChange={(e) => setNewCharacter({ ...newCharacter, greeting: e.target.value })}
                      className="bg-white/10 border-white/20 text-white mt-1"
                      placeholder="Como o personagem cumprimenta?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Categoria</Label>
                    <Input
                      value={newCharacter.category}
                      onChange={(e) => setNewCharacter({ ...newCharacter, category: e.target.value })}
                      className="bg-white/10 border-white/20 text-white mt-1"
                      placeholder="Ex: Fantasia, Sci-Fi, Anime..."
                    />
                  </div>
                  <Button
                    onClick={createCharacter}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!newCharacter.name || !newCharacter.personality || !newCharacter.greeting}
                  >
                    Criar Personagem
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bem-vindo ao Z-Chat! 🎉
          </h2>
          <p className="text-white/70">
            Escolha um personagem e comece a conversar. Mensagens ilimitadas, sem restrições, 100% gratuito!
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              ✓ Mensagens Ilimitadas
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              ✓ 100% Gratuito
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              ✓ Sem Restrições
            </Badge>
          </div>
        </div>

        {/* Lista por Categorias */}
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {characters
                  .filter((c) => c.category === category)
                  .map((character) => (
                    <Card
                      key={character.id}
                      className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                      onClick={() => selectCharacter(character)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                            {character.avatar}
                          </div>
                          <div>
                            <CardTitle className="text-white">{character.name}</CardTitle>
                            <Badge variant="outline" className="border-white/20 text-white/60 mt-1">
                              {character.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-white/60 line-clamp-2">
                          {character.description}
                        </CardDescription>
                        <div className="mt-3 flex items-center gap-2 text-purple-400 text-sm">
                          <MessageCircle className="w-4 h-4" />
                          <span>Clicar para conversar</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">Carregando personagens...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-black/20 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/40 text-sm">
          <p>Z-Chat © 2024 - Sua plataforma de personagens AI</p>
          <p className="mt-1">Mensagens ilimitadas • Sem restrições • 100% Gratuito</p>
        </div>
      </div>
    </div>
  )
}
