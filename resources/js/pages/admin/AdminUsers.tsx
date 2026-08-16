import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { AdminCard, AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { adminUsers } from '../../data/admin';
import { formatShortDate } from '../../utils/format';
import { useSeo } from '../../utils/seo';

const rolePermissions = [
{
  role: 'Super Admin',
  text: 'Accès complet, y compris la gestion des utilisateurs, des rôles et des paramètres système.'
},
{
  role: 'Administrateur',
  text: 'Gestion des produits, commandes, devis, actualités, messages et partenaires.'
},
{
  role: 'Éditeur',
  text: 'Gestion des actualités et du contenu éditorial du site uniquement.'
}];


export function AdminUsers() {
  useSeo(
    'Utilisateurs | Administration Sincery Prestations',
    'Gestion des comptes administrateurs et attribution des rôles.'
  );

  return (
    <>
      <AdminPageHeader
        title="Utilisateurs"
        description="Comptes ayant accès à l’espace d’administration."
        actions={
        <Button size="sm">
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Ajouter un utilisateur
          </Button>
        } />


      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <caption className="sr-only">Liste des utilisateurs</caption>
              <thead className="bg-surface-alt text-sm text-black/65">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Utilisateur
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Rôle
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Dernière connexion
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Statut
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {adminUsers.map((user) =>
                <tr key={user.id}>
                    <td className="px-4 py-3">
                      <span className="block text-base font-semibold text-black/90">
                        {user.name}
                      </span>
                      <span className="block text-sm text-black/45">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-base text-black/65">
                      {user.role}
                    </td>
                    <td className="px-4 py-3 text-base text-black/65">
                      {formatShortDate(user.lastLogin)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={user.active ? 'success' : 'neutral'}>
                        {user.active ? 'Actif' : 'Désactivé'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                        type="button"
                        aria-label={`Modifier ${user.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-surface-alt hover:text-brand">

                          <PencilIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                        type="button"
                        aria-label={`Supprimer ${user.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-black/45 hover:bg-danger-bg hover:text-danger">

                          <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard className="p-4">
          <h2 className="text-lg font-semibold text-black/90">
            Rôles et permissions
          </h2>
          <dl className="mt-3 space-y-3">
            {rolePermissions.map((item) =>
            <div key={item.role}>
                <dt className="text-base font-semibold text-black/90">
                  {item.role}
                </dt>
                <dd className="text-sm text-black/65">{item.text}</dd>
              </div>
            )}
          </dl>
        </AdminCard>
      </div>
    </>);

}
