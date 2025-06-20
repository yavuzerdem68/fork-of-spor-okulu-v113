import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/security'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create default sports branches
  const sportsBranches = [
    'Basketbol',
    'Hentbol', 
    'Yüzme',
    'Akıl ve Zeka Oyunları',
    'Satranç',
    'Futbol',
    'Voleybol',
    'Tenis',
    'Badminton',
    'Masa Tenisi',
    'Atletizm',
    'Jimnastik',
    'Karate',
    'Taekwondo',
    'Judo',
    'Boks',
    'Güreş',
    'Halter',
    'Bisiklet',
    'Kayak',
    'Buz Pateni',
    'Eskrim',
    'Hareket Eğitimi'
  ]

  console.log('📚 Creating sports branches...')
  for (const branchName of sportsBranches) {
    await prisma.sportsBranch.upsert({
      where: { name: branchName },
      update: {},
      create: {
        name: branchName,
        description: `${branchName} spor branşı`,
        isActive: true
      }
    })
  }

  // Create default training groups
  const trainingGroups = [
    { name: 'Minikler (6-8 yaş)', description: '6-8 yaş grubu antrenmanları' },
    { name: 'Küçükler (9-11 yaş)', description: '9-11 yaş grubu antrenmanları' },
    { name: 'Yıldızlar (12-14 yaş)', description: '12-14 yaş grubu antrenmanları' },
    { name: 'Gençler (15-17 yaş)', description: '15-17 yaş grubu antrenmanları' },
    { name: 'Büyükler (18+ yaş)', description: '18 yaş üstü antrenmanları' },
    { name: 'Başlangıç Seviyesi', description: 'Yeni başlayanlar için' },
    { name: 'Orta Seviye', description: 'Orta seviye sporcular için' },
    { name: 'İleri Seviye', description: 'İleri seviye sporcular için' },
    { name: 'Yarışma Takımı', description: 'Yarışmalara katılan sporcular' }
  ]

  console.log('👥 Creating training groups...')
  for (const group of trainingGroups) {
    await prisma.trainingGroup.upsert({
      where: { name: group.name },
      update: {},
      create: {
        name: group.name,
        description: group.description,
        isActive: true
      }
    })
  }

  // Create default admin user
  console.log('👤 Creating default admin user...')
  const hashedPassword = await hashPassword('admin123')
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sportscr.com' },
    update: {},
    create: {
      email: 'admin@sportscr.com',
      firstName: 'Sistem',
      lastName: 'Yöneticisi',
      role: 'ADMIN',
      password: hashedPassword,
      isActive: true,
      adminProfile: {
        create: {
          permissions: {
            canManageUsers: true,
            canManageAthletes: true,
            canManageTrainings: true,
            canManagePayments: true,
            canViewReports: true,
            canManageSettings: true
          }
        }
      }
    },
    include: {
      adminProfile: true
    }
  })

  // Create sample coach user
  console.log('🏃‍♂️ Creating sample coach user...')
  const coachPassword = await hashPassword('coach123')
  
  const coachUser = await prisma.user.upsert({
    where: { email: 'coach@sportscr.com' },
    update: {},
    create: {
      email: 'coach@sportscr.com',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      phone: '+905551234567',
      role: 'COACH',
      password: coachPassword,
      isActive: true,
      coachProfile: {
        create: {
          sportsBranches: ['Basketbol', 'Futbol'],
          trainingGroups: ['Yıldızlar (12-14 yaş)', 'Gençler (15-17 yaş)']
        }
      }
    },
    include: {
      coachProfile: true
    }
  })

  // Create sample parent user
  console.log('👨‍👩‍👧‍👦 Creating sample parent user...')
  const parentPassword = await hashPassword('parent123')
  
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@sportscr.com' },
    update: {},
    create: {
      email: 'parent@sportscr.com',
      username: 'mehmetyilmaz1234',
      firstName: 'Mehmet',
      lastName: 'Yılmaz',
      phone: '+905559876543',
      role: 'PARENT',
      password: parentPassword,
      isActive: true,
      parentProfile: {
        create: {
          tcNo: '12345678901',
          relation: 'Baba'
        }
      }
    },
    include: {
      parentProfile: true
    }
  })

  // Create sample athlete
  console.log('🏃‍♀️ Creating sample athlete...')
  const basketballBranch = await prisma.sportsBranch.findUnique({
    where: { name: 'Basketbol' }
  })
  
  const yildizlarGroup = await prisma.trainingGroup.findUnique({
    where: { name: 'Yıldızlar (12-14 yaş)' }
  })

  if (parentUser.parentProfile && basketballBranch && yildizlarGroup) {
    const athlete = await prisma.athlete.create({
      data: {
        firstName: 'Elif',
        lastName: 'Yılmaz',
        tcNo: '98765432109',
        birthDate: new Date('2010-05-15'),
        age: 14,
        gender: 'Kız',
        school: 'Lüleburgaz Anadolu Lisesi',
        class: '9-A',
        status: 'ACTIVE',
        paymentStatus: 'CURRENT',
        parentId: parentUser.parentProfile.id,
        sportsBranches: {
          create: {
            sportsBranchId: basketballBranch.id
          }
        },
        trainingGroups: {
          create: {
            trainingGroupId: yildizlarGroup.id
          }
        }
      }
    })

    // Create sample account entry for the athlete
    await prisma.accountEntry.create({
      data: {
        athleteId: athlete.id,
        type: 'DEBIT',
        description: 'Aralık 2024 Aidatı',
        amountExcludingVat: 350.00,
        vatRate: 10.00,
        vatAmount: 35.00,
        amountIncludingVat: 385.00,
        unitCode: 'Ay',
        month: '2024-12'
      }
    })

    console.log('✅ Sample athlete and account entry created')
  }

  // Create sample training
  console.log('🏋️‍♂️ Creating sample training...')
  if (coachUser.coachProfile && basketballBranch && yildizlarGroup) {
    await prisma.training.create({
      data: {
        name: 'Basketbol Antrenmanı - Yıldızlar',
        description: 'Temel basketbol teknikleri ve takım oyunu',
        startDate: new Date('2024-12-25T16:00:00Z'),
        endDate: new Date('2024-12-25T18:00:00Z'),
        location: 'Spor Salonu A',
        isRecurring: true,
        recurringDays: ['Salı', 'Perşembe', 'Cumartesi'],
        maxParticipants: 20,
        coachId: coachUser.coachProfile.id,
        sportsBranchId: basketballBranch.id,
        trainingGroupId: yildizlarGroup.id
      }
    })
  }

  // Create system settings
  console.log('⚙️ Creating system settings...')
  const systemSettings = [
    { key: 'school_name', value: 'Lüleburgaz Spor Okulu', category: 'general', description: 'Okul adı' },
    { key: 'school_address', value: 'Lüleburgaz, Kırklareli', category: 'general', description: 'Okul adresi' },
    { key: 'school_phone', value: '+902884123456', category: 'general', description: 'Okul telefonu' },
    { key: 'school_email', value: 'info@luleburgazsporokulu.com', category: 'general', description: 'Okul email' },
    { key: 'currency', value: 'TRY', category: 'financial', description: 'Para birimi' },
    { key: 'default_vat_rate', value: '10', category: 'financial', description: 'Varsayılan KDV oranı' },
    { key: 'timezone', value: 'Europe/Istanbul', category: 'general', description: 'Saat dilimi' },
    { key: 'email_notifications', value: 'true', category: 'notifications', description: 'Email bildirimleri' },
    { key: 'sms_notifications', value: 'false', category: 'notifications', description: 'SMS bildirimleri' },
    { key: 'backup_frequency', value: 'weekly', category: 'system', description: 'Yedekleme sıklığı' }
  ]

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📋 Created:')
  console.log(`   • ${sportsBranches.length} sports branches`)
  console.log(`   • ${trainingGroups.length} training groups`)
  console.log('   • 1 admin user (admin@sportscr.com / admin123)')
  console.log('   • 1 coach user (coach@sportscr.com / coach123)')
  console.log('   • 1 parent user (parent@sportscr.com / parent123)')
  console.log('   • 1 sample athlete')
  console.log('   • 1 sample training')
  console.log(`   • ${systemSettings.length} system settings`)
  console.log('\n🚀 Your SportsCRM database is ready to use!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })