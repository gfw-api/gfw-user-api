const LANGUAGE_MAPPING = {
    Government: [
        'Government',
        '政府',
        'Gouvernement',
        'Pemerintah',
        'Governo',
        'Gobierno',
    ],
    'Donor Institution / Agency': [
        'Donor Institution / Agency',
        '捐赠机构',
        'Institution / agence donatrice',
        'Lembaga / Badan Donor',
        'Instituição / Agência Doadora',
        'Agencia / Organismo de ayuda o asistencia financiera',
    ],
    'Local NGO (national or subnational)': [
        'Local NGO (national or subnational)',
        '本地 NGO（国家级或亚国家级）',
        'ONG locale (nationale ou infranationale)',
        'LSM Lokal (nasional atau daerah)',
        'ONG local (nacional ou subnacional)',
        'ONG local (nacional o subnacional)',
    ],
    'International NGO': [
        'International NGO',
        '国际 NGO',
        'ONG internationale',
        'LSM Internasional',
        'ONG internacional',
        'ONG internacional',
    ],
    'UN or International Organization': [
        'UN or International Organization',
        '联合国或国际组织',
        'ONU ou organisation internationale',
        'PBB atau Organisasi Internasional',
        'ONU ou Organização Internacional',
        'ONU u otra organización internacional',
    ],
    'Academic / Research Organization': [
        'Academic / Research Organization',
        '学术/研究组织',
        'Organisation académique / de recherche',
        'Organisasi Akademis / Penelitian',
        'Organização de Pesquisa / Acadêmica',
        'Organización académica / de investigación',
    ],
    'Journalist / Media Organization': [
        'Journalist / Media Organization',
        '新闻工作者/媒体组织',
        'Organisation journalistique / médiatique',
        'Organisasi Wartawan / Media',
        'Organização de Mídia / Jornalista',
        'Organización de periodistas / medios de comunicación',
    ],
    'Indigenous or Community-Based Organization': [
        'Indigenous or Community-Based Organization',
        '本土或基于社区的组织',
        'Organisation autochtone ou communautaire',
        'Organisasi Masyarakat Adat atau Berbasis Komunitas',
        'Organização Indígena ou Comunitária',
        'Organización indígena o comunitaria',
    ],
    'Private sector': [
        'Private sector',
        '私营部门',
        'Secteur privé',
        'Sektor swasta',
        'Setor privado',
        'Sector privado',
    ],
    'Individual / No Affiliation': [
        'Individual / No Affiliation',
        '个人/无隶属关系',
        'Affiliation individuelle / Aucune affiliation',
        'Pribadi / Tidak Ada Afiliasi',
        'Individual / Sem Filiação',
        'Particular / Sin afiliación',
    ],
    Other: [
        'Other',
        '其他',
        'Autre',
        'Lainnya',
        'Outro',
        'Otro',
    ]
};

const uniformizeSector = (sector) => Object.keys(LANGUAGE_MAPPING)
    .find((key) => LANGUAGE_MAPPING[key].includes(sector));

module.exports = {
    SUPPORTED_SECTORS: Object.keys(LANGUAGE_MAPPING),
    uniformizeSector,
};
