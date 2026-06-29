import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* HEADER */}
        <section>
          <h1 className="text-4xl font-bold mb-4">
            Kbank - Core Banking Architecture Showcase
          </h1>

          <p className="text-lg text-gray-600">
            Démonstrateur technique simulant un système bancaire minimaliste
            basé sur COBOL, fichiers indexés/séquentiels et une interface web
            moderne.
          </p>
          <div className="flex justify-around my-7">
            <Link href="https://github.com/Paskri/kbank-api">
              <Button variant={'kbank'}>Code Backend</Button>
            </Link>
            <Link href="https://github.com/Paskri/kbank-front">
              <Button variant={'kbank'}>Code Frontend</Button>
            </Link>
          </div>
        </section>
        <Image
          src="/architecture.png"
          alt="Architecture générale KBank"
          width={1200}
          height={800}
          className="w-full h-auto"
          priority
        />
        <section className="space-y-4">
          <h2 className="text-xl font-semibold w-full bg-blue-200 px-3 rounded-sm">
            Technologies mises en œuvre
          </h2>

          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold mb-6">Frontend</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Next.js</li>
                <li>React</li>
                <li>TypeScript</li>
                <li>TailwindCSS</li>
                <li>Shadcn UI</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6">Backend (API)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Node.js</li>
                <li>Express</li>

                <li>Simulation mainframe via GnuCOBOL</li>
                <li>Programmes batch COBOL</li>
                <li>Fichiers indexés ISAM</li>
                <li>Fichiers sequentiels</li>
              </ul>
            </div>
          </div>
        </section>
        {/* COMPETENCES */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 w-full bg-blue-200 px-3 rounded-sm">
            Compétences mises en œuvre
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-6">
                COBOL & systèmes de données
              </h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Manipulation de fichiers indexés (accès direct par clé)</li>
                <li>
                  Utilisation de fichiers séquentiels pour traitements batch
                </li>
                <li>
                  Gestion des opérations CRUD métier sur données financières
                </li>
                <li>Simulation de logique mainframe (VSAM-like behavior)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6">
                Logique bancaire & transactionnelle
              </h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Dépôt et retrait sur comptes bancaires</li>
                <li>Virements internes (compte à compte)</li>
                <li>Virements inter-clients</li>
                <li>Simulation de paiements par carte</li>
                <li>Modélisation d’un flux transactionnel cohérent</li>
              </ul>
            </div>
          </div>
        </section>

        {/* PERSPECTIVES */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 w-full bg-blue-200 px-3 rounded-sm">
            Perspectives d’évolution
          </h2>

          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>
              Mise en place d’un système de batch automatisé (CRON toutes les
              2h)
            </li>
            <li>Résolution différée des paiements par carte</li>
            <li>Ajout d’un moteur de règles métier plus avancé</li>
            <li>Simulation de traitements bancaires nocturnes</li>
            <li>
              Amélioration de la traçabilité des opérations (audit complet)
            </li>
            <li>Extension vers des fonctionnalités de reporting financier</li>
          </ul>
        </section>

        {/* BILAN */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 w-full bg-blue-200 px-3 rounded-sm">
            Bilan
          </h2>

          <p className="text-gray-700 leading-relaxed">
            KBank est un projet de démonstration technique visant à reproduire
            les mécanismes fondamentaux d’un système bancaire simplifié en
            combinant des technologies mainframe (COBOL) et une interface web
            moderne.
          </p>

          <p className="text-gray-700 leading-relaxed mt-4">
            Malgré son périmètre volontairement réduit (5 clients, 2 comptes par
            client), le projet met en évidence des problématiques réelles de
            systèmes financiers : cohérence des transactions, gestion des
            écritures, et robustesse des traitements batch.
          </p>

          <p className="text-gray-700 leading-relaxed mt-4">
            L’objectif principal est de démontrer une compréhension des
            architectures legacy tout en sachant les exposer dans un
            environnement moderne et exploitable.
          </p>
        </section>
      </main>
    </>
  )
}
