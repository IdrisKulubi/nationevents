import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page - NXT HERizon Summit</h1>
          <p className="text-xl text-gray-600">Testing the new features and styling</p>
        </div>

        {/* Color Test */}
        <Card>
          <CardHeader>
            <CardTitle>Color Scheme Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-summit-blue text-white rounded-lg text-center">
                <div className="text-2xl font-bold">Summit Blue</div>
                <div className="text-sm">#0875b6</div>
              </div>
              <div className="p-4 bg-amaranth-purple text-white rounded-lg text-center">
                <div className="text-2xl font-bold">Amaranth Purple</div>
                <div className="text-sm">#ac0650</div>
              </div>
              <div className="p-4 bg-rose-red text-white rounded-lg text-center">
                <div className="text-2xl font-bold">Rose Red</div>
                <div className="text-sm">#c9065c</div>
              </div>
              <div className="p-4 bg-dogwood-rose text-white rounded-lg text-center">
                <div className="text-2xl font-bold">Dogwood Rose</div>
                <div className="text-sm">#d60764</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Test */}
        <Card>
          <CardHeader>
            <CardTitle>Button Styles Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button style={{ backgroundColor: '#0875b6' }} className="text-white">
                Primary Button
              </Button>
              <Button variant="outline" className="border-summit-blue text-summit-blue">
                Outline Button
              </Button>
              <Button className="bg-amaranth-purple hover:bg-rose-red text-white">
                Pink Button
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Badge Test */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Styles Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-summit-blue/5 border-summit-blue/30 text-summit-blue">
                Summit Badge
              </Badge>
              <Badge variant="outline" className="bg-amaranth-purple/5 border-amaranth-purple/30 text-amaranth-purple">
                Pink Badge
              </Badge>
              <Badge className="bg-summit-blue text-white">
                Primary Badge
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Links Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <a href="/register">Registration</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/attendees">Attendees Directory</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/speakers">Speakers</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/resources">Resources</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/feedback">Feedback</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gradient Test */}
        <Card>
          <CardHeader>
            <CardTitle>Gradient Backgrounds Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-8 rounded-lg summit-gradient text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Summit Gradient</h3>
                <p>Blue to Pink gradient</p>
              </div>
              <div className="p-8 rounded-lg pink-gradient text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Pink Gradient</h3>
                <p>Amaranth to Dogwood Rose</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 